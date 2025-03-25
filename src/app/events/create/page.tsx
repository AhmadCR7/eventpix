'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { addEvent } from '../../lib/events';
import Alert from '../../components/Alert';

export default function CreateEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pin, setPin] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
    description?: string;
    pin?: string;
  }>({});
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  // Track whether an event was just created
  const [eventCreated, setEventCreated] = useState(false);
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setIsPrivate(checked);
      
      // Clear PIN if event is set to public
      if (name === 'isPrivate' && !checked) {
        setPin('');
      }
    } else {
      if (name === 'name') {
        setEventName(value);
      } else if (name === 'date') {
        setEventDate(value);
      } else if (name === 'description') {
        setDescription(value);
      } else if (name === 'pin') {
        setPin(value);
      } else if (name === 'welcomeMessage') {
        setWelcomeMessage(value);
      }
    }
  };

  const generateRandomPin = () => {
    // Generate random 4-digit PIN
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(randomPin);
  };

  const validateForm = () => {
    const newErrors: {name?: string; date?: string; description?: string; pin?: string} = {};
    
    if (!eventName.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!eventDate) {
      newErrors.date = 'Event date is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (isPrivate && (!pin || pin.length !== 4)) {
      newErrors.pin = 'Private events require a 4-digit PIN';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create a new event using the server action
        await addEvent({
          name: eventName.trim(),
          date: new Date(eventDate).toISOString(),
          welcomeMessage: welcomeMessage.trim(),
          description: description.trim(),
          private: isPrivate,
          pin: isPrivate ? pin : null,
          userId: session?.user?.id // Pass the user ID to associate the event with the user
        });
        
        // Reset the form
        setEventName('');
        setEventDate('');
        setWelcomeMessage('');
        setDescription('');
        setIsPrivate(false);
        setPin('');
        
        // Show success message
        setSuccessMessage('Event created successfully!');
        setEventCreated(true);
        
        // Clear success message after 5 seconds, but keep the "View All Events" button
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } catch (error) {
        console.error('Error creating event:', error);
        setSuccessMessage('Failed to create event. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
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
            <h1 className="text-3xl font-sans font-bold mb-3 text-rose-600">Create New Event</h1>
            <p className="text-gray-600 font-sans">
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
              <h2 className="text-2xl font-sans font-bold mb-4 text-gray-800">Event Created!</h2>
              <p className="text-gray-600 mb-8 font-sans">
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
            <form onSubmit={handleSubmit} className="space-y-8 font-sans">
              <div className="form-group">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name*
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="name"
                  value={eventName}
                  onChange={handleChange}
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
                  name="date"
                  value={eventDate}
                  onChange={handleChange}
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
                  name="welcomeMessage"
                  value={welcomeMessage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                  placeholder="Welcome message for your guests..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={6}
                  placeholder="Tell your guests about this event..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-4">
                  <input
                    id="isPrivate"
                    name="isPrivate"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                    Make this event private (requires PIN access)
                  </label>
                </div>
                
                {isPrivate && (
                  <div className="ml-7">
                    <div className="flex items-end space-x-2">
                      <div className="flex-grow">
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                          Event PIN (4 digits)
                        </label>
                        <input
                          id="pin"
                          name="pin"
                          type="text"
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={pin}
                          onChange={handleChange}
                          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="4-digit PIN"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={generateRandomPin}
                        className="px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Generate PIN
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Share this PIN with your guests to allow them access to the event
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Link href="/events" className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md disabled:bg-rose-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 