'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEdit } from "react-icons/fa";
import DeleteButton from './DeleteButton';

interface EventBannerProps {
  bannerUrl: string | null;
  eventName: string;
  eventDate: string;
  eventId: string;
  isAdmin: boolean;
  isHost: boolean;
  canManageEvent: boolean;
}

export default function EventBanner({
  bannerUrl, 
  eventName,
  eventDate,
  eventId,
  isAdmin,
  isHost,
  canManageEvent,
}: EventBannerProps) {
  const [imageError, setImageError] = useState(false);
  
  // Log the bannerUrl when component mounts
  useEffect(() => {
    if (bannerUrl) {
      console.log('EventBanner: Received banner URL:', bannerUrl);
    } else {
      console.log('EventBanner: No banner URL provided');
    }
  }, [bannerUrl]);
  
  // Implement formatDate locally
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate a gradient background based on event name
  const getGradient = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 60) % 360}, 80%, 60%))`;
  };
  
  const handleImageError = () => {
    console.error('EventBanner: Image failed to load, falling back to gradient');
    setImageError(true);
  };
  
  const backgroundStyle = bannerUrl && !imageError 
    ? { backgroundImage: `url("${bannerUrl}")` }
    : { background: getGradient(eventName) };
  
  return (
    <div 
      className="h-48 relative bg-cover bg-center flex items-end"
      style={backgroundStyle}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      <div className="w-full p-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{eventName}</h1>
          <div className="flex items-center text-white">
            <svg 
              className="w-5 h-5 mr-2" 
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
            <span className="drop-shadow-md">{formatDate(eventDate)}</span>
          </div>
        </div>
        
        {canManageEvent && (
          <div className="flex gap-2 mt-4 md:mt-0">
            {isHost && (
              <Link
                href={`/events/${eventId}/edit`}
                className="flex items-center bg-white bg-opacity-50 backdrop-blur-md text-white font-medium py-2 px-6 rounded-md transition-all shadow"
              >
                <FaEdit className="mr-2" /> Edit
              </Link>
            )}
            
            <DeleteButton eventId={eventId} eventName={eventName} />
          </div>
        )}
      </div>
    </div>
  );
} 