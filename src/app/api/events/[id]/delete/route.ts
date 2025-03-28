import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dov2iujbo',
  api_key: process.env.CLOUDINARY_API_KEY || '867292617218286',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gGk80RJ-RBUNXRwRFy3dJRjjtUE'
});

// Common delete function that is used by both GET and POST methods
async function deleteEventById(eventId: string, clerkUserId: string) {
  console.log(`Deleting event: ${eventId} for clerk user: ${clerkUserId}`);
  
  // Step 1: Find the event and verify it exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      photos: true,
    },
  });

  if (!event) {
    console.log(`Event not found: ${eventId}`);
    return { success: false, error: 'Event not found', status: 404 };
  }

  // Step 2: Find the database user to check ownership
  const dbUser = await prisma.user.findFirst({
    where: { externalId: clerkUserId },
  });

  if (!dbUser) {
    console.log(`User not found for clerk ID: ${clerkUserId}`);
    return { success: false, error: 'User not found', status: 404 };
  }

  // Step 3: Check if the user is the owner
  if (event.userId !== dbUser.id) {
    console.log(`Unauthorized: user ${dbUser.id} is not the owner of event ${eventId}`);
    return { success: false, error: 'Not authorized to delete this event', status: 403 };
  }

  // Step 4: Delete Cloudinary photos if any
  if (event.photos?.length > 0) {
    console.log(`Deleting ${event.photos.length} photos from Cloudinary`);
    
    for (const photo of event.photos) {
      if (photo.publicId) {
        try {
          console.log(`Deleting Cloudinary photo: ${photo.publicId}`);
          await cloudinary.uploader.destroy(photo.publicId);
        } catch (error) {
          console.error(`Error deleting photo ${photo.publicId}:`, error);
          // Continue with other photos
        }
      }
    }
  }

  // Step 5: Delete photos from the database
  console.log(`Deleting photos from database for event: ${eventId}`);
  await prisma.photo.deleteMany({
    where: { eventId },
  });

  // Step 6: Delete the event
  console.log(`Deleting event from database: ${eventId}`);
  await prisma.event.delete({
    where: { id: eventId },
  });

  console.log(`Event deleted successfully: ${eventId}`);
  return { success: true, status: 200 };
}

// Handler for POST requests (from forms)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('POST delete request received for event:', params.id);
  
  try {
    const eventId = params.id;
    
    // Get authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.redirect(new URL('/sign-in?redirect=/events', req.url));
    }
    
    const result = await deleteEventById(eventId, clerkUserId);
    
    if (result.success) {
      // Redirect to events page on success
      return NextResponse.redirect(new URL('/events?deleted=true', req.url));
    } else {
      // Redirect with error
      return NextResponse.redirect(new URL(`/events?error=${result.error}`, req.url));
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.redirect(new URL('/events?error=server-error', req.url));
  }
}

// Handler for DELETE requests (from API calls)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('DELETE request received for event:', params.id);
  
  try {
    const eventId = params.id;
    
    // Get authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const result = await deleteEventById(eventId, clerkUserId);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Event deleted successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Handler for GET requests (from direct links)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('GET delete request received for event:', params.id);
  
  try {
    const eventId = params.id;
    
    // Get authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.redirect(new URL('/sign-in?redirect=/events', req.url));
    }
    
    const result = await deleteEventById(eventId, clerkUserId);
    
    if (result.success) {
      // Redirect to events page on success
      return NextResponse.redirect(new URL('/events?deleted=true', req.url));
    } else {
      // Redirect with error
      return NextResponse.redirect(new URL(`/events?error=${result.error}`, req.url));
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.redirect(new URL('/events?error=server-error', req.url));
  }
} 