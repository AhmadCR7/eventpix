import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Disable the default body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure Cloudinary with CORRECTED credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
  api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
});

// Extract file from multipart form data
async function extractFileFromFormData(req: NextRequest) {
  // Create a buffer from the request
  const formData = await req.arrayBuffer();
  const buffer = Buffer.from(formData);
  
  // Find the boundary that separates the form parts
  const contentType = req.headers.get('content-type') || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type header');
  }
  
  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  // Find the positions of boundaries
  let pos = 0;
  const boundaries = [];
  
  while (pos < buffer.length) {
    const index = buffer.indexOf(boundaryBuffer, pos);
    if (index === -1) break;
    boundaries.push(index);
    pos = index + boundaryBuffer.length;
  }
  
  if (boundaries.length < 2) {
    throw new Error('Could not find file boundaries in form data');
  }
  
  let file: any = null;
  let uploaderName: string | null = null;
  
  // Process each form part to find the file and uploaderName
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = (i < boundaries.length - 1) ? boundaries[i + 1] : buffer.length;
    
    const part = buffer.slice(start, end);
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    
    if (headerEnd === -1) continue;
    
    const header = part.slice(0, headerEnd).toString();
    const content = part.slice(headerEnd + 4, part.length - 2); // -2 to remove final \r\n
    
    // Check if this part is the uploaderName field
    if (header.includes('Content-Disposition: form-data') && 
        header.includes('name="uploaderName"')) {
      uploaderName = content.toString().trim() || null;
      console.log('Found uploaderName:', uploaderName);
      continue;
    }
    
    // Check if this part is a file
    if (header.includes('Content-Disposition: form-data') && 
        header.includes('filename=')) {
      
      // Extract content type if available
      const contentTypeMatch = header.match(/Content-Type: ([^\r\n]+)/i);
      const fileType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
      
      // Get filename from header
      const filenameMatch = header.match(/filename="([^"]+)"/i);
      const filename = filenameMatch ? filenameMatch[1] : `file-${Date.now()}`;
      
      // Extract file extension
      const ext = path.extname(filename) || '.jpg';
      
      // Create a temp file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${uuid()}${ext}`);
      
      // Save the file
      fs.writeFileSync(tempFilePath, content);
      
      // Check file size
      const stats = fs.statSync(tempFilePath);
      console.log(`Extracted file: ${filename}, size: ${stats.size} bytes, type: ${fileType}`);
      
      if (stats.size === 0) {
        fs.unlinkSync(tempFilePath);
        throw new Error('Empty file extracted');
      }
      
      file = {
        filePath: tempFilePath,
        originalFilename: filename,
        mimetype: fileType,
        size: stats.size,
        cleanup: () => {
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
              console.log(`Cleaned up temp file: ${tempFilePath}`);
            }
          } catch (error) {
            console.error('Error cleaning up temp file:', error);
          }
        }
      };
    }
  }
  
  if (!file) {
    throw new Error('No file found in the multipart form data');
  }
  
  return { ...file, uploaderName };
}

// Handle POST request to upload a photo
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  const eventId = id;
  
  try {
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    console.log(`Processing upload for event ID: ${eventId}`);
    
    // Default cleanup function (does nothing)
    let cleanup = () => {};
    
    try {
      // Parse form data and extract the file and uploaderName
      console.log('Extracting file from form data...');
      const { filePath, originalFilename, mimetype, size, cleanup: fileCleanup, uploaderName } = 
        await extractFileFromFormData(req);
      
      // Update the cleanup function
      cleanup = fileCleanup;
      
      console.log(`Successfully extracted file: ${originalFilename} (${size} bytes, ${mimetype})`);
      if (uploaderName) {
        console.log(`Uploader name: ${uploaderName}`);
      }
      
      // Generate a unique public ID for the upload
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `photo_${timestamp}_${Math.floor(Math.random() * 1000)}`;
      const folder = `guestpix/events/${eventId}`;
      
      // Get Cloudinary credentials for logging
      const cloudName = cloudinary.config().cloud_name;
      const apiKey = cloudinary.config().api_key;
      const apiSecret = cloudinary.config().api_secret;
      
      console.log('Using Cloudinary config:', {
        cloud_name: cloudName,
        api_key: apiKey?.substring(0, 6) + '...',
        api_secret: apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : 'Not set'
      });
      
      // Configure upload options - simplify to match our working test implementations
      const uploadOptions = {
        folder,
        resource_type: 'auto' as 'auto',
        public_id: publicId,
      };
      
      console.log('Uploading to Cloudinary with options:', JSON.stringify(uploadOptions));
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      
      console.log('Cloudinary upload successful!', result.public_id);
      
      // Save photo URL, public ID, and uploaderName to database
      const photo = await prisma.photo.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          uploaderName: uploaderName || null, // Store uploaderName if provided
          eventId: eventId
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        url: result.secure_url,
        publicId: result.public_id,
        photoId: photo.id,
        originalFilename: originalFilename,
        uploaderName: uploaderName || null
      });
    } catch (error: any) {
      console.error('Cloudinary upload error details:', error);
      
      // Provide helpful error messages based on the specific error
      if (error.http_code === 401) {
        console.error('Authentication error. Please check your Cloudinary credentials.');
        return NextResponse.json(
          { error: 'Authentication error. Please check your Cloudinary credentials.' },
          { status: 500 }
        );
      } else if (error.http_code === 404) {
        console.error('Resource not found. Check your Cloudinary configuration.');
        return NextResponse.json(
          { error: 'Resource not found. Check your Cloudinary configuration.' },
          { status: 500 }
        );
      } else {
        console.error('Error uploading photo:', error);
        return NextResponse.json(
          { error: 'Failed to upload photo', details: error.message },
          { status: 500 }
        );
      }
    } finally {
      // Clean up the temporary file
      cleanup();
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 