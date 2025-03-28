import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/app/lib/prisma';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
  api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
});

// Handle POST requests for form-based deletion (with _method=DELETE)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  // Check for method override
  try {
    const formData = await req.formData();
    const methodOverride = formData.get('_method');
    
    if (methodOverride === 'DELETE') {
      return await handlePhotoDelete(params.id, params.photoId, req);
    }
    
    return NextResponse.json({ error: 'Invalid method override' }, { status: 400 });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Handle direct DELETE requests
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  return await handlePhotoDelete(params.id, params.photoId, req);
}

// Common function to handle photo deletion
async function handlePhotoDelete(eventId: string, photoId: string, req: NextRequest) {
  console.log(`Deleting photo ${photoId} from event ${eventId}`);
  
  try {
    // Validate parameters
    if (!eventId || !photoId) {
      console.error('Missing parameters:', { eventId, photoId });
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
      console.error('Photo not found:', photoId);
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Check if photo belongs to the given event
    if (photo.eventId !== eventId) {
      console.error('Photo does not belong to event:', { photoEventId: photo.eventId, requestedEventId: eventId });
      return NextResponse.json(
        { error: 'Photo does not belong to this event' },
        { status: 403 }
      );
    }

    // Delete photo from Cloudinary if publicId exists
    if (photo.publicId) {
      try {
        console.log(`Deleting photo from Cloudinary with publicId: ${photo.publicId}`);
        await cloudinary.uploader.destroy(photo.publicId);
        console.log('Photo deleted from Cloudinary');
      } catch (cloudinaryError) {
        // Log error but continue with database deletion
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Delete photo record from database
    await prisma.photo.delete({
      where: { id: photoId },
    });
    console.log('Photo deleted from database successfully');

    // Support both form-based and API requests
    const acceptHeader = req.headers.get('accept');
    if (acceptHeader && acceptHeader.includes('text/html')) {
      // For form submissions, redirect back to the event page
      return NextResponse.redirect(new URL(`/events/${eventId}`, req.url));
    }

    // For API requests, return a JSON response
    return NextResponse.json({ 
      success: true,
      message: 'Photo deleted successfully',
      photoId: photoId
    });
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo', details: error.message },
      { status: 500 }
    );
  }
} 