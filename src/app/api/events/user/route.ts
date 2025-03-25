import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// Simplified auth check function for demo purposes
function getUserIdFromRequest() {
  // In a real app, you'd get the userId from the session cookie or JWT token
  // For this demo, we'll return a dummy host ID
  return 'host-1234';
}

export async function GET() {
  try {
    // Get user ID using simple auth check
    const userId = getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch the user's events from the database
    const events = await prisma.event.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Return the events
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 