'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event, addEvent } from '../../lib/events';
import Alert from '../../components/Alert';

export default function CreateEvent() {
  const router = useRouter();
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
  }>({});
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  // Track whether an event was just created
  const [eventCreated, setEventCreated] = useState(false);

  const validateForm = () => {
    const newErrors: {name?: string; date?: string} = {};
    
    if (!eventName.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!eventDate) {
      newErrors.date = 'Event date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create a new event object
      const newEvent: Event = {
        id: Date.now().toString(),
        name: eventName.trim(),
        date: eventDate,
        welcomeMessage: welcomeMessage.trim(),
      };
      
      // Add to our in-memory array using the shared function
      addEvent(newEvent);
      
      // Log the current list of events
      console.log('Event created:', newEvent);
      
      // Reset the form
      setEventName('');
      setEventDate('');
      setWelcomeMessage('');
      
      // Show success message
      setSuccessMessage('Event created successfully!');
      setEventCreated(true);
      
      // Clear success message after 5 seconds, but keep the "View All Events" button
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/events" 
          className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-rose-100 p-8 mb-12">
          <div className="mb-8">
            <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-3 text-rose-600">Create New Event</h1>
            <p className="text-gray-600">
              Fill out the form below to create a new event for your guests.
            </p>
          </div>
          
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              autoClose={true}
              duration={5000}
            />
          )}
          
          {eventCreated ? (
            <div className="text-center py-10">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">Event Created!</h2>
              <p className="text-gray-600 mb-8">
                Your event has been created successfully. You can now view it in your events list.
              </p>
              <Link 
                href="/events" 
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
              >
                View All Events
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="form-group">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name*
                </label>
                <input
                  type="text"
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Wedding, Birthday Party, etc."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date*
                </label>
                <input
                  type="date"
                  id="eventDate"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={6}
                  placeholder="Add a welcome message for your guests..."
                />
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Link href="/events" className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 