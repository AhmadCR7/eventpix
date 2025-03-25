'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

// Component that uses useSearchParams
function VerifyPinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [pin, setPin] = useState('');
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) return;
      
      try {
        const response = await fetch(`/api/events/${eventId}/minimal`);
        const data = await response.json();
        
        if (response.ok && data.name) {
          setEventName(data.name);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      }
    }
    
    fetchEventDetails();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }
    
    if (!eventId) {
      setError('Event ID is missing');
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
      
      if (response.ok && data.verified) {
        // Redirect to the event page if PIN is correct
        router.push(`/guest/${eventId}`);
      } else {
        setError(data.error || 'Invalid PIN. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Missing Event ID</h2>
          <p className="text-gray-600 mb-6">No event was specified. Please use the link provided by the event host.</p>
          <Link 
            href="/" 
            className="inline-block bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-2">
            Private Event
          </h2>
          {eventName && (
            <p className="text-xl text-gray-700 mb-4">
              {eventName}
            </p>
          )}
          <p className="text-gray-600">
            This event requires a PIN to access. Please enter the PIN provided by the event host.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              type="text"
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-center text-2xl tracking-widest"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-rose-600 text-white p-3 rounded-md hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:bg-rose-400"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-rose-600 hover:text-rose-800 text-sm">
              Return to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function VerifyPin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    }>
      <VerifyPinContent />
    </Suspense>
  );
} 