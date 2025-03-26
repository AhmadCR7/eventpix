'use server';

import { redirect } from 'next/navigation';
import { getCurrentUserId } from './user';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * Server action to create a new event
 */
export async function createEvent(formData: FormData) {
  // Get the current user's database ID
  const userId = await getCurrentUserId();
  
  // If no user ID, redirect to sign in
  if (!userId) {
    console.error('No user ID found when creating event');
    redirect('/sign-in?redirect_url=/events/create');
  }
  
  // Get form data
  const name = formData.get('name') as string;
  const date = formData.get('date') as string;
  const welcomeMessage = formData.get('welcomeMessage') as string || '';
  const description = formData.get('description') as string;
  const isPrivate = formData.get('isPrivate') === 'on';
  const pin = isPrivate ? formData.get('pin') as string : null;
  
  // Validate required fields
  if (!name || !date || !description) {
    console.error('Missing required fields for event creation');
    throw new Error('Missing required fields');
  }
  
  // Validate PIN if event is private
  if (isPrivate && (!pin || pin.length !== 4 || !/^\d+$/.test(pin))) {
    console.error('Invalid PIN for private event');
    throw new Error('Private events require a 4-digit PIN');
  }
  
  try {
    console.log('Creating event with user ID:', userId);
    
    // Create the event in the database
    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        welcomeMessage,
        description,
        private: isPrivate,
        pin,
        userId,
      },
    });
    
    console.log('Event created successfully:', event.id);
    
    // Revalidate the events path to update the UI
    revalidatePath('/events');
    
    // Redirect to the newly created event
    redirect(`/events/${event.id}`);
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
} 