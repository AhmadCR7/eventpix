'use client';

import { useState, useEffect, useRef } from 'react';
import { GuestbookMessage } from '../../lib/guestbook';

interface GuestGuestbookProps {
  eventId: string;
  eventName: string;
}

export default function GuestGuestbook({ eventId, eventName }: GuestGuestbookProps) {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load name from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem(`guestpix_uploader_${eventId}`);
    if (savedName) {
      setName(savedName);
    }
  }, [eventId]);

  // Load messages when component mounts
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/guestbook`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching guestbook messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Refresh messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate message
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/events/${eventId}/guestbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || undefined, // Only send name if it's not empty
          message: message.trim(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post message');
      }
      
      // Save name to localStorage if provided
      if (name.trim()) {
        localStorage.setItem(`guestpix_uploader_${eventId}`, name.trim());
      }
      
      // Reset form
      setMessage('');
      setSuccessMessage('Thank you for your message!');
      
      // Refresh messages
      fetchMessages();
      
    } catch (err: any) {
      console.error('Error posting message:', err);
      setError(err.message || 'Failed to post message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800 text-center">
        Event Guestbook
      </h2>
      
      {/* Message submission form */}
      <div className="mb-8 bg-rose-50 p-6 rounded-lg border border-rose-100">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Leave a Message</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
            <p>{successMessage}</p>
          </div>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 h-24"
              placeholder="Share your thoughts or well wishes..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Message'}
          </button>
        </form>
      </div>
      
      {/* Messages display */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-700">Messages from Guests</h3>
        
        {isLoading ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">Be the first to leave a message!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    {msg.name || 'Anonymous Guest'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(msg.createdAt)}
                  </p>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 