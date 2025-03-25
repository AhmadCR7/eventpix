import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../../../../../lib/prisma';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
  api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
});

// Handle DELETE request to remove a photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    // Get the parameters
    const id = await params.id;
    const photoId = await params.photoId;

    if (!id || !photoId) {
      return NextResponse.json(
        { error: 'Event ID and Photo ID are required' },
        { status: 400 }
      );
    }

    // Find the photo in the database
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    // Check if photo exists
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Check if photo belongs to the given event
    if (photo.eventId !== id) {
      return NextResponse.json(
        { error: 'Photo does not belong to this event' },
        { status: 403 }
      );
    }

    // Delete photo from Cloudinary if publicId exists
    if (photo.publicId) {
      try {
        console.log(`Deleting photo from Cloudinary with publicId: ${photo.publicId}`);
        
        // Delete the photo from Cloudinary
        const result = await cloudinary.uploader.destroy(photo.publicId);
        
        console.log('Cloudinary delete result:', result);
        
        // Check if deletion was successful
        if (result.result !== 'ok') {
          console.warn(`Warning: Cloudinary deletion returned status ${result.result}`);
        }
      } catch (cloudinaryError: any) {
        // Log error but continue with database deletion
        console.error('Error deleting from Cloudinary:', cloudinaryError.message);
      }
    } else {
      console.warn('No publicId found for photo, skipping Cloudinary deletion');
    }

    // Delete photo record from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo', details: error.message },
      { status: 500 }
    );
  }
} 