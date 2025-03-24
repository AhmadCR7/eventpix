'use client';

import React from 'react';
import Link from 'next/link';
import { getAllEvents } from '../lib/events';

export default function EventsListPage() {
  // Get all events from our shared store
  const events = getAllEvents();
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Truncate welcome message for display if it's too long
  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-4xl font-['Playfair_Display'] font-bold text-rose-600 mb-6 md:mb-0">
          All Events
        </h1>
        <Link 
          href="/events/create" 
          className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md self-start md:self-auto"
        >
          Create New Event
        </Link>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-rose-100 text-center">
          <svg 
            className="w-20 h-20 text-rose-300 mx-auto mb-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h2 className="text-2xl font-['Playfair_Display'] font-semibold text-gray-700 mb-4">
            No events found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create your first event to get started collecting photos from your guests!
          </p>
          <Link 
            href="/events/create" 
            className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
          >
            Create an Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {events.map(event => (
            <div 
              key={event.id} 
              className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-rose-300 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-['Playfair_Display'] font-semibold mb-3">
                    <Link 
                      href={`/events/${event.id}`}
                      className="text-gray-800 hover:text-rose-600 hover:underline"
                    >
                      {event.name}
                    </Link>
                  </h2>
                  <p className="text-gray-600 flex items-center">
                    <svg 
                      className="w-5 h-5 mr-2 text-rose-400" 
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
                    {formatDate(event.date)}
                  </p>
                </div>
                
                <div className="flex space-x-4 mt-5 md:mt-0">
                  <Link 
                    href={`/events/${event.id}`}
                    className="bg-white text-rose-600 hover:text-rose-800 px-5 py-2 border border-rose-300 rounded-full hover:bg-rose-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/events/${event.id}/edit`}
                    className="bg-white text-gray-600 hover:text-gray-800 px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              
              {event.welcomeMessage && (
                <div className="mt-6 bg-rose-50 p-6 rounded-lg border border-rose-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Welcome Message:
                  </h3>
                  <p className="text-gray-600 italic">
                    "{truncateMessage(event.welcomeMessage)}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 