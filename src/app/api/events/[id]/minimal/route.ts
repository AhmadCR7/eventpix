import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Minimal endpoint that returns just enough information about an event
// for the verification page to display the event name
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID parameter using String conversion
    const id = String(params.id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Find the event with minimal information
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        private: true
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Return minimal event info
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching minimal event data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 