'use server';

import prisma from './prisma';

// Types for the Guestbook functionality

export interface GuestbookMessage {
  id: string;
  eventId: string;
  name: string | null;
  message: string;
  createdAt: string;
  approved: boolean;
}

// API response types
export interface GuestbookApiResponse {
  messages: GuestbookMessage[];
}

export interface GuestbookPostResponse {
  success: boolean;
  message: GuestbookMessage;
}

export interface GuestbookErrorResponse {
  error: string;
}

// Get all guestbook messages for an event
export async function getGuestbookMessages(eventId: string): Promise<GuestbookMessage[]> {
  try {
    const messages = await prisma.guestbookMessage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }, // Newest first
    });
    
    // Transform the data to match our interface
    return messages.map((message: any) => ({
      id: message.id,
      eventId: message.eventId,
      name: message.name || null,
      message: message.message,
      createdAt: message.createdAt.toISOString(),
      approved: message.approved ?? true,
    }));
  } catch (error) {
    console.error('Error fetching guestbook messages:', error);
    return [];
  }
}

// Add a new guestbook message
export async function addGuestbookMessage(
  eventId: string, 
  message: string, 
  name?: string
): Promise<GuestbookMessage | null> {
  try {
    const newMessage = await prisma.guestbookMessage.create({
      data: {
        eventId,
        message,
        name: name || null,
      },
    });
    
    return {
      id: newMessage.id,
      eventId: newMessage.eventId,
      name: newMessage.name,
      message: newMessage.message,
      createdAt: newMessage.createdAt.toISOString(),
      approved: newMessage.approved ?? true,
    };
  } catch (error) {
    console.error('Error adding guestbook message:', error);
    return null;
  }
}

// Delete a guestbook message
export async function deleteGuestbookMessage(id: string): Promise<boolean> {
  try {
    await prisma.guestbookMessage.delete({
      where: { id },
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting guestbook message:', error);
    return false;
  }
} 