'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getEventById, deleteEventById } from '../../lib/events';
import { useParams, useRouter } from 'next/navigation';
import Alert from '../../components/Alert';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  // Get the event by ID
  const event = getEventById(eventId);
  
  // UI state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle delete event
  const handleDeleteEvent = () => {
    // Prompt the user for confirmation
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the event "${event?.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      setIsDeleting(true);
      
      try {
        const success = deleteEventById(eventId);
        
        if (success) {
          // Redirect to the events list
          router.push('/events');
        } else {
          // Set error if deletion fails
          setDeleteError('Failed to delete the event. Please try again.');
          setIsDeleting(false);
        }
      } catch (error) {
        console.error(`Error deleting event with ID: ${eventId}`, error);
        setDeleteError('An unexpected error occurred. Please try again.');
        setIsDeleting(false);
      }
    }
  };
  
  // If event not found, show error message
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-rose-100 p-12 text-center">
          <svg 
            className="w-20 h-20 text-rose-500 mx-auto mb-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">Event Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">
            We couldn't find an event with the ID: {eventId}
          </p>
          <Link 
            href="/events" 
            className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
          >
            Back to All Events
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      {deleteError && (
        <Alert 
          type="error" 
          message={deleteError} 
          onClose={() => setDeleteError('')}
        />
      )}
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <Link 
            href="/events" 
            className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Events
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
            <div className="bg-rose-600 text-white p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-3">{event.name}</h1>
                  <div className="flex items-center text-rose-100">
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-lg">{formatDate(event.date)}</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link 
                    href={`/events/${eventId}/edit`}
                    className="bg-white text-rose-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium"
                  >
                    Edit Event
                  </Link>
                  <button 
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {event.welcomeMessage ? (
                <div className="mb-10">
                  <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">Welcome Message</h2>
                  <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {event.welcomeMessage}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-10">
                  <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">Welcome Message</h2>
                  <p className="text-gray-500 italic p-6 bg-rose-50 rounded-lg border border-rose-100">No welcome message provided.</p>
                </div>
              )}
              
              <div className="mb-10">
                <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">Photos</h2>
                <div className="bg-rose-50 p-10 rounded-lg border border-rose-100 text-center">
                  <div className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 text-lg mb-4">No photos uploaded yet</p>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    Share your event with guests to start collecting photos.
                  </p>
                  <button className="bg-white text-rose-600 border border-rose-300 px-6 py-2 rounded-full hover:bg-rose-50 transition-colors shadow-sm text-sm font-medium">
                    Get Event Link
                  </button>
                </div>
              </div>
              
              <div className="border-t border-rose-100 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="text-gray-500 mb-4 md:mb-0">
                  <p>Event ID: {event.id}</p>
                  <p>Created: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="text-gray-600 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm"
                  >
                    Share Event
                  </button>
                  <button 
                    className="text-gray-600 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm"
                  >
                    Download Photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 