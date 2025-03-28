'use client';

import React, { useState, useEffect } from 'react';

interface GuestBannerProps {
  bannerUrl: string | null;
  eventName: string;
  eventDate: string;
}

export default function GuestBanner({
  bannerUrl, 
  eventName,
  eventDate,
}: GuestBannerProps) {
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (bannerUrl) {
      console.log('GuestBanner: Received banner URL:', bannerUrl);
    } else {
      console.log('GuestBanner: No banner URL provided');
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
    console.error('GuestBanner: Image failed to load, falling back to gradient');
    setImageError(true);
  };
  
  const backgroundStyle = bannerUrl && !imageError 
    ? { backgroundImage: `url("${bannerUrl}")` }
    : { background: getGradient(eventName) };
  
  return (
    <div 
      className="h-48 relative bg-cover bg-center flex items-center justify-center"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      <div className="relative z-10 text-center text-white p-6">
        <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{eventName}</h1>
        <div className="flex items-center justify-center">
          <svg 
            className="w-4 h-4 mr-2" 
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
    </div>
  );
} 