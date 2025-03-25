'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [pin, setPin] = useState('');
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  useEffect(() => {
    // Fetch minimal event data to display the name
    if (eventId) {
      fetch(`/api/events/${eventId}/minimal`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch event');
          return res.json();
        })
        .then(data => {
          setEventName(data.name);
          setIsLoadingEvent(false);
        })
        .catch(err => {
          console.error('Error fetching event:', err);
          setError('Event not found');
          setIsLoadingEvent(false);
        });
    } else {
      setError('No event ID provided');
      setIsLoadingEvent(false);
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }
    
    if (!eventId) {
      setError('Missing event ID');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/events/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, pin }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to verify PIN');
        setIsLoading(false);
        return;
      }
      
      // Successfully verified, redirect to event page
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Failed to verify PIN. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error === 'Event not found' || error === 'No event ID provided') {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-rose-100 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">{error}</h1>
          <p className="text-gray-600 mt-2">The event you're looking for doesn't exist or was removed.</p>
          <Link 
            href="/events" 
            className="mt-6 inline-block px-6 py-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
        <div className="bg-rose-600 text-white p-6">
          <h1 className="text-2xl font-bold">Private Event</h1>
          <p className="text-rose-100 mt-1">This event requires a PIN to access</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {eventName}
            </h2>
            <p className="text-gray-600">
              The host has made this event private. Please enter the PIN provided by the event host.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                Event PIN
              </label>
              <input
                type="text"
                id="pin"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors text-lg"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Link 
                href="/events" 
                className="text-gray-600 hover:text-gray-800"
              >
                Back to Events
              </Link>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:bg-rose-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Access Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 