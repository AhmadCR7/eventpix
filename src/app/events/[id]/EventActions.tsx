'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { deleteEventById } from '../../lib/events';

export default function EventActions({ 
  eventId, 
  eventName,
  isAdmin = false,
  isOwner = false
}: { 
  eventId: string;
  eventName: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // UI state
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Handle delete event
  const handleDeleteEvent = async () => {
    // Determine message based on user role
    const confirmMessage = isAdmin && !isOwner
      ? `As an admin, you are about to delete the event "${eventName}" created by another user. This action cannot be undone.`
      : `Are you sure you want to delete the event "${eventName}"? This action cannot be undone.`;
    
    // Prompt the user for confirmation
    const confirmDelete = window.confirm(confirmMessage);
    
    if (confirmDelete) {
      setIsDeleting(true);
      setError('');
      
      try {
        // Call the server action to delete the event with user context
        const success = await deleteEventById(eventId, userId, isAdmin);
        
        if (success) {
          // Redirect to the events list
          router.push('/events');
          router.refresh();
        } else {
          setError('Failed to delete event. Please try again.');
          setIsDeleting(false);
        }
      } catch (error: any) {
        console.error(`Error deleting event with ID: ${eventId}`, error);
        setError(error.message || 'An unexpected error occurred. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  // Only render the action buttons if the user is either admin or the owner
  if (!isAdmin && !isOwner) {
    return null;
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex gap-3">
        {/* Only show Edit if user is the owner */}
        {isOwner && (
          <Link 
            href={`/events/${eventId}/edit`}
            className="bg-white text-rose-600 px-5 py-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium border border-rose-200"
          >
            Edit Event
          </Link>
        )}
        <button 
          onClick={handleDeleteEvent}
          disabled={isDeleting}
          className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : isAdmin && !isOwner ? 'Delete as Admin' : 'Delete Event'}
        </button>
      </div>
    </>
  );
} 