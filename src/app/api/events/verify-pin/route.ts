import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate input
    const { eventId, pin } = body;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }
    
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if the event is public (doesn't require PIN)
    if (!event.private) {
      return NextResponse.json({ verified: true }, { status: 200 });
    }
    
    // Verify the PIN
    if (event.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
    
    // Create a response
    const response = NextResponse.json({ verified: true }, { status: 200 });
    
    // Set a cookie to remember that this user has verified for this event
    // Cookie name uses the event ID to make it specific to this event
    response.cookies.set(`verified_event_${eventId}`, 'true', {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
} 