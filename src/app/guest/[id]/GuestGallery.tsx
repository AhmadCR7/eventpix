'use client';

import { useState } from 'react';
import { Photo } from '../../lib/events';
import OptimizedImage from '@/app/components/OptimizedImage';

interface GuestGalleryProps {
  photos: Photo[];
  eventId: string;
}

export default function GuestGallery({ photos, eventId }: GuestGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-rose-50 p-6 rounded-lg border border-rose-100 text-center">
        <div className="w-14 h-14 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-700 text-md mb-2">No photos uploaded yet</p>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Be the first to add photos to this event!
        </p>
      </div>
    );
  }

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Open the modal with the selected photo
  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  // Close the modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="relative h-36 sm:h-40 w-full cursor-pointer" 
              onClick={() => openPhotoModal(photo)}
            >
              <OptimizedImage 
                src={photo.url} 
                alt={`Event photo ${photo.id}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
              />
            </div>
            {photo.uploaderName && (
              <div className="p-2 bg-white">
                <div className="text-xs text-gray-700">
                  <span>By: {photo.uploaderName}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button 
              onClick={closePhotoModal} 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 z-10 hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-h-[80vh] relative">
              <div className="w-full h-[80vh] relative">
                <OptimizedImage 
                  src={selectedPhoto.url} 
                  alt={`Event photo ${selectedPhoto.id}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Image metadata */}
            <div className="bg-white p-3 rounded-b-lg shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {formatDate(selectedPhoto.createdAt)}
                </span>
                {selectedPhoto.uploaderName && (
                  <span className="text-sm text-gray-700 font-medium">
                    By: {selectedPhoto.uploaderName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 