'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventById, updateEvent } from '../../../lib/events';
import Alert from '../../../components/Alert';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    welcomeMessage: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load event data on component mount
  useEffect(() => {
    const event = getEventById(eventId);
    
    if (event) {
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = new Date(event.date).toISOString().split('T')[0];
      
      setEventData({
        name: event.name,
        date: formattedDate,
        welcomeMessage: event.welcomeMessage || ''
      });
    } else {
      setError('Event not found');
    }
  }, [eventId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate inputs
      if (!eventData.name.trim()) {
        setError('Event name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!eventData.date) {
        setError('Event date is required');
        setIsSubmitting(false);
        return;
      }
      
      // Update the event
      const success = updateEvent(eventId, {
        name: eventData.name,
        date: eventData.date,
        welcomeMessage: eventData.welcomeMessage
      });
      
      if (success) {
        setSuccess('Event updated successfully!');
        // Navigate back to event details after a brief delay
        setTimeout(() => {
          router.push(`/events/${eventId}`);
        }, 1500);
      } else {
        setError('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (error === 'Event not found') {
    return (
      <div className="container mx-auto px-4 py-16">
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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link 
          href={`/events/${eventId}`} 
          className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Event Details
        </Link>

        {error && error !== 'Event not found' && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
          />
        )}
        
        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
          />
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 p-8 mb-12">
          <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-8 text-rose-600">Edit Event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Event Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={eventData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                placeholder="Enter event name"
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                Event Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="welcomeMessage" className="block text-gray-700 font-medium mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={eventData.welcomeMessage}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                placeholder="Enter a welcome message for your guests"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Link 
                href={`/events/${eventId}`}
                className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 