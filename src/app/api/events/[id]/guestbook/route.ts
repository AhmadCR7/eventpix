import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getGuestbookMessages, addGuestbookMessage, deleteGuestbookMessage } from '@/app/lib/guestbook';

// GET /api/events/[id]/guestbook - Get all guestbook messages for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await the dynamic parameter in Next.js 15+
  const id = await params.id;
  const eventId = id;
  
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get messages for this event
    const messages = await getGuestbookMessages(eventId);
    
    // Only return approved messages (in a real app with auth, you'd check if the user is the event owner)
    const filteredMessages = messages.filter(msg => msg.approved);
    
    return NextResponse.json(filteredMessages);
    
  } catch (error) {
    console.error('Error fetching guestbook messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guestbook messages' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/guestbook - Add a new guestbook message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await the dynamic parameter in Next.js 15+
  const id = await params.id;
  const eventId = id;
  
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { name, message } = await request.json();
    
    // Validate required fields
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be a string of 100 characters or less' },
        { status: 400 }
      );
    }
    
    // Check if message is too long
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be 2000 characters or less' },
        { status: 400 }
      );
    }
    
    // Add the message
    const newMessage = await addGuestbookMessage(
      eventId,
      message,
      name ? name : undefined
    );
    
    if (!newMessage) {
      return NextResponse.json(
        { error: 'Failed to add message' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error adding guestbook message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// DELETE handler for moderating messages (optional)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const messageId = url.searchParams.get('messageId');
  
  if (!messageId) {
    return NextResponse.json(
      { error: 'Message ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Delete the message
    const success = await deleteGuestbookMessage(messageId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guestbook message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
} 