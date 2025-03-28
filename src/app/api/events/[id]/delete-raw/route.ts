import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

// Extremely simplified GET handler for direct deletion via links
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('RAW DELETE route called for event:', params.id);
  
  // Get redirect URL from query params
  const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/events';
  console.log('Redirect URL:', redirectUrl);
  
  try {
    // Step 1: Authenticate
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log('Not authenticated');
      return NextResponse.redirect(new URL(`/sign-in?redirect=/events`, req.url));
    }
    
    // Step 2: Get event ID
    const eventId = params.id;
    
    // Step 3: Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { photos: true }
    });
    
    if (!event) {
      console.log('Event not found');
      return NextResponse.redirect(new URL(`/events?error=event-not-found`, req.url));
    }
    
    // Step 4: Get user
    const dbUser = await prisma.user.findFirst({
      where: { externalId: clerkUserId }
    });
    
    if (!dbUser) {
      console.log('User not found');
      return NextResponse.redirect(new URL(`/events?error=user-not-found`, req.url));
    }
    
    // Step 5: Check ownership
    if (event.userId !== dbUser.id) {
      console.log('Not the owner');
      return NextResponse.redirect(new URL(`/events?error=not-authorized`, req.url));
    }
    
    // Step 6: Delete Cloudinary photos
    if (event.photos?.length > 0) {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
        api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
      });
      
      // Delete photos
      for (const photo of event.photos) {
        if (photo.publicId) {
          try {
            console.log(`Deleting photo: ${photo.publicId}`);
            await cloudinary.uploader.destroy(photo.publicId);
          } catch (error) {
            console.error('Error deleting photo:', error);
          }
        }
      }
    }
    
    // Step 7: Delete photos from database
    console.log('Deleting photos from database');
    await prisma.photo.deleteMany({
      where: { eventId }
    });
    
    // Step 8: Delete event
    console.log('Deleting event from database');
    await prisma.event.delete({
      where: { id: eventId }
    });
    
    console.log('Event successfully deleted');
    
    // Step 9: Redirect to events page
    return NextResponse.redirect(new URL(`${redirectUrl}?deleted=true`, req.url));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.redirect(new URL(`/events?error=server-error`, req.url));
  }
} 