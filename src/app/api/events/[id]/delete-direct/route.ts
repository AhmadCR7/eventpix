import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { redirect } from 'next/navigation';

// Handle POST request to delete an event (simpler approach)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔥 DELETE-DIRECT POST route called with params:', params);
  
  try {
    // Get the event ID from the URL parameter
    const eventId = params.id;
    console.log('🔥 API route - Deleting event:', eventId);

    // Get authentication details
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error('❌ Unauthorized delete attempt - user not authenticated');
      return new Response('Unauthorized - You must be signed in', { status: 401 });
    }

    console.log('🔥 API route - User authenticated:', clerkUserId);

    // First, try to find the event to confirm it exists
    console.log('🔥 Looking up event in database:', eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        photos: true, // Include photos to handle cleanup
        user: true    // Include user to check ownership
      }
    });

    // If event doesn't exist, return 404
    if (!event) {
      console.error('❌ Event not found for deletion:', { eventId });
      return new Response('Event not found', { status: 404 });
    }

    console.log('🔥 Found event for deletion:', { 
      eventId, 
      eventName: event.name,
      ownerId: event.userId,
      photoCount: event.photos?.length || 0
    });

    // Check if current user is the owner of the event
    // Get the database user ID linked to current Clerk user
    const dbUser = await prisma.user.findFirst({
      where: { externalId: clerkUserId }
    });

    if (!dbUser) {
      console.error('❌ DB user not found for Clerk user:', clerkUserId);
      return new Response('User account error', { status: 403 });
    }

    // Check ownership - only allow owner to delete
    if (event.userId !== dbUser.id) {
      console.error('❌ Unauthorized deletion attempt - not the owner:', { 
        eventId, 
        requestedByUserId: dbUser.id, 
        eventOwnerId: event.userId 
      });
      return new Response('Not authorized to delete this event', { status: 403 });
    }

    console.log('✅ Authorization check passed, proceeding with deletion');

    // Configure Cloudinary if photos need to be deleted
    if (event.photos?.length > 0) {
      console.log('🔥 Configuring Cloudinary for photo deletion');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
        api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
      });
    }

    // Delete photos from Cloudinary
    if (event.photos?.length > 0) {
      console.log(`🔥 Found ${event.photos.length} photos to clean up`);
      
      for (const photo of event.photos) {
        if (photo.publicId) {
          try {
            console.log(`🔥 Deleting photo from Cloudinary: ${photo.publicId}`);
            await cloudinary.uploader.destroy(photo.publicId);
          } catch (cloudinaryError) {
            console.error('⚠️ Error deleting photo from Cloudinary:', cloudinaryError);
            // Continue with deletion despite Cloudinary errors
          }
        }
      }
    }

    // Delete related photos from the database
    try {
      console.log('🔥 Deleting photos from database for event:', eventId);
      const deletedPhotos = await prisma.photo.deleteMany({
        where: { eventId },
      });
      console.log(`✅ Successfully deleted ${deletedPhotos.count} photos for event:`, eventId);
    } catch (photoDeleteError) {
      console.error('❌ Error deleting event photos:', photoDeleteError);
      return new Response('Failed to delete event photos', { status: 500 });
    }

    // Delete the event from the database
    try {
      console.log('🔥 Deleting event from database:', eventId);
      await prisma.event.delete({
        where: { id: eventId },
      });
      
      console.log('✅ Event deleted successfully:', { eventId });
      
      // Redirect to events page on success
      redirect('/events');
    } catch (deleteError) {
      console.error('❌ Database error during event deletion:', deleteError);
      return new Response('Failed to delete event', { status: 500 });
    }
  } catch (error) {
    console.error('❌ Unexpected error deleting event:', error);
    return new Response('An unexpected error occurred', { status: 500 });
  }
} 