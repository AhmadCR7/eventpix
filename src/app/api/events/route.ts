import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simplified auth check function for demo purposes
function getUserIdFromRequest() {
  // In a real app, you'd get the userId from the session cookie or JWT token
  // For this demo, we'll return a dummy host ID
  return 'host-1234';
}

export async function POST(request: Request) {
  try {
    // Get user ID using simple auth check
    const userId = getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get event data from request
    const { name, date, welcomeMessage, pin, private: isPrivate } = await request.json();

    // Validate required fields
    if (!name || !date) {
      return NextResponse.json(
        { error: 'Event name and date are required' },
        { status: 400 }
      );
    }

    // Create the event in the database
    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        welcomeMessage: welcomeMessage || '',
        pin: pin || null,
        private: isPrivate || false,
        userId,
      },
    });

    // Return the created event
    return NextResponse.json(
      { message: 'Event created successfully', event },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 