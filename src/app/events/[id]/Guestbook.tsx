'use client';

import { useState, useEffect, useRef } from 'react';
import { GuestbookMessage } from '../../lib/guestbook';

interface GuestbookProps {
  eventId: string;
}

export default function Guestbook({ eventId }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Handle message deletion (for moderation)
  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/events/${eventId}/guestbook?messageId=${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
      
      // Refresh messages
      fetchMessages();
      
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-10">
      <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">Guestbook</h2>
      
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 h-32"
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
        <h3 className="text-lg font-medium mb-4 text-gray-700">Messages</h3>
        
        {isLoading ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No guestbook messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {msg.name || 'Anonymous Guest'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                  
                  {/* Delete button for moderation (optional) */}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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