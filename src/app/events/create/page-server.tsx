import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createEvent } from '../../lib/actions';

export default async function CreateEventPage() {
  // Check if user is authenticated
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect_url=/events/create');
  }
  
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
          
          <form action={createEvent} className="space-y-8 font-sans">
            <div className="form-group">
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                Event Name*
              </label>
              <input
                type="text"
                id="eventName"
                name="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Wedding, Birthday Party, etc."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date*
              </label>
              <input
                type="date"
                id="eventDate"
                name="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                rows={6}
                placeholder="Tell your guests about this event..."
                required
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <input
                  id="isPrivate"
                  name="isPrivate"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Make this event private (requires PIN access)
                </label>
              </div>
              
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
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="4-digit PIN"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Link 
                href="/events"
                className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 