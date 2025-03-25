'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

// Component that uses useSearchParams
function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');
  
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventName, setEventName] = useState('');
  
  // Fetch event name on mount
  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}/minimal`)
        .then(res => res.json())
        .then(data => {
          if (data.name) {
            setEventName(data.name);
          }
        })
        .catch(err => {
          console.error('Error fetching event details:', err);
        });
    }
  }, [eventId]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!pin) {
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
        // Redirect to the event page
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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900">
            Private Event
          </h2>
          {eventName && (
            <p className="mt-2 text-lg text-gray-600">
              "{eventName}"
            </p>
          )}
          <p className="mt-4 text-gray-600">
            This event requires a PIN to access. Please enter the PIN provided by the event host.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              name="pin"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 text-center text-2xl tracking-widest"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify PIN'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-sm text-rose-600 hover:text-rose-800">
              Return to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
} 