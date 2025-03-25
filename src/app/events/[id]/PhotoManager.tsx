'use client';

import { useState, useEffect } from 'react';
import { getEventPhotos, Photo } from '../../lib/events';
import PhotoGallery from './PhotoGallery';
import UploadPhoto from './UploadPhoto';

interface PhotoManagerProps {
  eventId: string;
}

export default function PhotoManager({ eventId }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [eventId]);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-['Playfair_Display'] font-semibold text-gray-800">Photos</h2>
      </div>
      
      <div className="mb-6">
        <UploadPhoto eventId={eventId} onPhotoUploaded={fetchPhotos} />
      </div>

      {isLoading ? (
        <div className="bg-rose-50 p-10 rounded-lg border border-rose-100 text-center">
          <div className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
          <p className="text-gray-700 text-lg mb-4">Loading photos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center">
          <p className="text-red-700 mb-2">{error}</p>
          <button
            onClick={fetchPhotos}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <PhotoGallery 
          photos={photos} 
          eventId={eventId} 
          onPhotoDeleted={fetchPhotos} 
        />
      )}
    </div>
  );
} 