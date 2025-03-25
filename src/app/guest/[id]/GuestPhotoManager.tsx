'use client';

import { useState, useEffect } from 'react';
import { getEventPhotos, Photo } from '../../lib/events';
import GuestGallery from './GuestGallery';
import GuestUploadPhoto from './GuestUploadPhoto';

interface GuestPhotoManagerProps {
  eventId: string;
  eventName: string;
}

export default function GuestPhotoManager({ eventId, eventName }: GuestPhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState<string>('');

  // Save uploader name to localStorage when it changes
  useEffect(() => {
    if (uploaderName) {
      localStorage.setItem(`guestpix_uploader_${eventId}`, uploaderName);
    }
  }, [uploaderName, eventId]);

  // Load uploader name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem(`guestpix_uploader_${eventId}`);
    if (savedName) {
      setUploaderName(savedName);
    }
  }, [eventId]);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const photoData = await getEventPhotos(eventId);
      setPhotos(photoData);
      setError(null);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    
    // Set up an interval to refresh photos every 30 seconds
    const intervalId = setInterval(fetchPhotos, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [eventId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploaderName(e.target.value);
  };

  return (
    <div>
      {/* Name input */}
      <div className="mb-6">
        <label htmlFor="uploaderName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name (optional)
        </label>
        <input
          type="text"
          id="uploaderName"
          value={uploaderName}
          onChange={handleNameChange}
          placeholder="Enter your name to tag your uploads"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Your name will be displayed with your photos
        </p>
      </div>

      {/* Photos Gallery */}
      <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">
        Event Photos
      </h2>
      
      {isLoading && photos.length === 0 ? (
        <div className="bg-rose-50 p-6 rounded-lg border border-rose-100 text-center mb-6">
          <div className="w-14 h-14 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-3 animate-pulse">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
          <p className="text-gray-700">Loading photos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center mb-6">
          <p className="text-red-700 mb-2">{error}</p>
          <button
            onClick={fetchPhotos}
            className="mt-1 bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <GuestGallery photos={photos} eventId={eventId} />
        </div>
      )}

      {/* Upload Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">
          Upload Your Photos
        </h2>
        <GuestUploadPhoto 
          eventId={eventId} 
          eventName={eventName} 
          uploaderName={uploaderName}
          onPhotoUploaded={fetchPhotos}
        />
      </div>
    </div>
  );
} 