'use client';

import { useState } from 'react';
import { Photo } from '../../lib/events';
import toast from 'react-hot-toast';

interface PhotoGalleryProps {
  photos: Photo[];
  eventId: string;
  onPhotoDeleted: () => void;
}

export default function PhotoGallery({ photos, eventId, onPhotoDeleted }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-rose-50 p-10 rounded-lg border border-rose-100 text-center">
        <div className="w-16 h-16 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <p className="text-gray-700 text-lg mb-4">No photos uploaded yet</p>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Upload photos or share this event with guests to start collecting memories.
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

  // Delete photo directly without confirmation
  const deletePhoto = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the photo modal
    
    // Create and submit a form to delete the photo
    const form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'POST';
    form.action = `/api/events/${eventId}/photos/${photo.id}`;
    
    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);
    
    document.body.appendChild(form);
    form.submit();
    
    // Show toast notification
    toast.success('Deleting photo...');
    
    // If this photo is being viewed in the modal, close it
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(null);
    }
    
    // Update the photo list after a short delay
    setTimeout(onPhotoDeleted, 500);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="relative h-48 w-full cursor-pointer group" 
              onClick={() => openPhotoModal(photo)}
            >
              <div className="w-full h-full">
                <img 
                  src={photo.url} 
                  alt={`Event photo ${photo.id}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load image: ${photo.url}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                  }}
                />
              </div>
              
              {/* Delete button */}
              <button
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-80 focus:opacity-100 z-10"
                onClick={(e) => deletePhoto(photo, e)}
                title="Delete photo"
                aria-label="Delete photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="p-3 bg-white">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>ID: {photo.id.substring(0, 8)}...</span>
                <span>{formatDate(photo.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button 
              onClick={closePhotoModal} 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 z-10 hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Delete button in modal */}
            <button 
              onClick={(e) => deletePhoto(selectedPhoto, e)}
              className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-2 z-10 hover:bg-red-700"
              title="Delete photo"
              aria-label="Delete photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            {/* Image container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-h-[80vh] relative">
              <div className="w-full h-[80vh] flex items-center justify-center bg-gray-100">
                <img 
                  src={selectedPhoto.url}
                  alt={`Event photo ${selectedPhoto.id}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.error(`Failed to load image: ${selectedPhoto.url}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                  }}
                />
              </div>
            </div>
            
            {/* Image metadata */}
            <div className="bg-white p-4 rounded-b-lg shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Uploaded: {formatDate(selectedPhoto.createdAt)}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {selectedPhoto.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 