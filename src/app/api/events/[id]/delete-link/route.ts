import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

// Super simple GET route for deletion that redirects
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔥 DELETE-LINK route called with params:', params);
  
  // Get redirect URL from query params
  const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/events';
  console.log('🔥 Redirect URL:', redirectUrl);
  
  try {
    // Get the event ID from the URL parameter
    const eventId = params.id;
    console.log('🔥 GET API route - Deleting event:', eventId);

    // Get authentication details
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error('❌ Unauthorized delete attempt - user not authenticated');
      return NextResponse.redirect(new URL(`/sign-in?callbackUrl=${redirectUrl}`, req.url));
    }

    console.log('🔥 API route - User authenticated:', clerkUserId);

    // First, try to find the event to confirm it exists
    console.log('🔥 Looking up event in database:', eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        photos: true // Include photos to handle cleanup
      }
    });

    // If event doesn't exist, return 404
    if (!event) {
      console.error('❌ Event not found for deletion:', { eventId });
      return NextResponse.redirect(new URL(`/events?error=event-not-found`, req.url));
    }

    console.log('🔥 Found event for deletion:', { 
      eventId, 
      eventName: event.name,
      ownerId: event.userId,
      photoCount: event.photos?.length || 0
    });

    // Get the database user ID linked to current Clerk user
    const dbUser = await prisma.user.findFirst({
      where: { externalId: clerkUserId }
    });

    if (!dbUser) {
      console.error('❌ DB user not found for Clerk user:', clerkUserId);
      return NextResponse.redirect(new URL(`/events?error=user-not-found`, req.url));
    }

    // Check if user is owner of event
    const isOwner = event.userId === dbUser.id;
    console.log('🔥 User is owner:', isOwner);

    // For simplicity, only allow owners to delete
    if (!isOwner) {
      console.error('❌ User is not owner, cannot delete event');
      return NextResponse.redirect(new URL(`/events?error=unauthorized`, req.url));
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
            // Continue despite Cloudinary errors
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
      return NextResponse.redirect(new URL(`/events?error=failed-to-delete-photos`, req.url));
    }

    // Delete the event from the database
    try {
      console.log('🔥 Deleting event from database:', eventId);
      await prisma.event.delete({
        where: { id: eventId },
      });
      
      console.log('✅ Event deleted successfully:', { eventId });
      
      // Redirect to events page on success with success message
      return NextResponse.redirect(new URL(`${redirectUrl}?success=true`, req.url));
    } catch (deleteError) {
      console.error('❌ Database error during event deletion:', deleteError);
      return NextResponse.redirect(new URL(`/events?error=failed-to-delete-event`, req.url));
    }
  } catch (error) {
    console.error('❌ Unexpected error deleting event:', error);
    return NextResponse.redirect(new URL(`/events?error=unexpected-error`, req.url));
  }
} 