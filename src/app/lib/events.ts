'use server';

import prisma from './prisma';

// Define the Event interface for frontend usage
// This maintains backward compatibility with existing code
export interface Event {
  id: string;
  name: string;
  date: string;
  welcomeMessage: string;
  description?: string;
  pin?: string | null;
  private?: boolean;
  userId?: string | null;
  hostId?: string | null; // Add hostId to match what's coming from the database
  bannerUrl?: string | null; // Add bannerUrl for event banners
}

// Add an interface for photo data
export interface Photo {
  id: string;
  url: string;
  uploaderName?: string; // Add optional uploaderName property
  createdAt: string;
}

// Convert a database event to our frontend Event interface
const dbEventToEvent = (dbEvent: any): Event => {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    date: dbEvent.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    welcomeMessage: dbEvent.welcomeMessage || '',
    description: dbEvent.description || '',
    pin: dbEvent.pin,
    private: dbEvent.private || false,
    userId: dbEvent.userId || null,
    hostId: dbEvent.userId || null, // Map userId to hostId for backwards compatibility
    bannerUrl: dbEvent.bannerUrl || null, // Include the bannerUrl in the returned object
  };
};

// Helper function to add a new event
export async function addEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const dateObject = new Date(event.date);
  
  const newEvent = await prisma.event.create({
    data: {
      name: event.name,
      date: dateObject,
      welcomeMessage: event.welcomeMessage || '',
      description: event.description || '',
      pin: event.pin || null,
      private: event.private || false,
      bannerUrl: event.bannerUrl || null, // Include the bannerUrl in the create operation
      ...(event.userId ? { userId: event.userId } : {})
    },
  });
  
  return dbEventToEvent(newEvent);
}

// Helper function to get all events
export async function getAllEvents(userId?: string, isAdmin: boolean = false): Promise<Event[]> {
  try {
    // If no userId is provided, log warning and return empty array
    if (!userId && !isAdmin) {
      console.warn('getAllEvents called without userId and not as admin');
      return [];
    }
    
    // If user is admin, return all events
    // If userId is provided, filter by userId
    const where = isAdmin ? {} : { userId };
    
    console.log('Fetching events with query:', { where });
    
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    
    console.log(`Found ${events.length} events for user ${userId}`);
    
    return events.map(dbEventToEvent);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Helper function to get a single event by ID
export async function getEventById(id: string): Promise<Event | null> {
  const event = await prisma.event.findUnique({
    where: { id },
  });
  
  if (!event) return null;
  
  return dbEventToEvent(event);
}

// Helper function to update an existing event
export async function updateEvent(
  id: string, 
  updatedEvent: Omit<Event, 'id'>
): Promise<Event | null> {
  try {
    const dateObject = new Date(updatedEvent.date);
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        name: updatedEvent.name,
        date: dateObject,
        welcomeMessage: updatedEvent.welcomeMessage || '',
        description: updatedEvent.description || '',
        pin: updatedEvent.pin || null,
        private: updatedEvent.private || false,
        bannerUrl: updatedEvent.bannerUrl || null, // Include the bannerUrl in the update operation
      },
    });
    
    return dbEventToEvent(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
}

// Helper function to delete an event by ID
export async function deleteEventById(id: string | number, userId?: string, isAdmin?: boolean): Promise<boolean> {
  const stringId = id.toString();
  
  try {
    // If userId is provided and user is not admin, ensure they own the event
    if (userId && !isAdmin) {
      const event = await prisma.event.findUnique({
        where: { id: stringId },
      });
      
      // If event doesn't exist or doesn't belong to user, refuse deletion
      if (!event || event.userId !== userId) {
        console.error('Unauthorized attempt to delete event:', { eventId: stringId, requestedBy: userId });
        return false;
      }
    }
    
    // Proceed with deletion (user is authorized)
    await prisma.event.delete({
      where: { id: stringId },
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

// Add functions for photo management
export async function addPhotoToEvent(eventId: string, photoUrl: string): Promise<boolean> {
  try {
    await prisma.photo.create({
      data: {
        url: photoUrl,
        eventId,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error adding photo to event:', error);
    return false;
  }
}

export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const photos = await prisma.photo.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });
  
  return photos.map((photo: any) => ({
    id: photo.id,
    url: photo.url,
    uploaderName: photo.uploaderName || undefined, // Include uploaderName in the result
    createdAt: photo.createdAt.toISOString(),
  }));
} 