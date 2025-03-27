'use client';

import { useState } from 'react';
import { Photo } from '../../lib/events';
import ConfirmModal from '@/app/components/ConfirmModal';
import toast from 'react-hot-toast';

interface PhotoGalleryProps {
  photos: Photo[];
  eventId: string;
  onPhotoDeleted: () => void;
}

export default function PhotoGallery({ photos, eventId, onPhotoDeleted }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Show delete confirmation modal
  const showDeleteConfirmation = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the photo modal
    setPhotoToDelete(photo);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setPhotoToDelete(null);
  };

  // Handle photo deletion
  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    // Reset any previous errors
    setDeleteError(null);
    setIsDeleting(true);
    
    try {
      // Make DELETE request to the API
      const response = await fetch(`/api/events/${eventId}/photos/${photoToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to delete photo: ${response.status}`);
      }
      
      // Close the modal if this photo was being viewed
      if (selectedPhoto && selectedPhoto.id === photoToDelete.id) {
        setSelectedPhoto(null);
      }
      
      // Call the callback to refresh the photos list
      onPhotoDeleted();
      toast.success('Photo deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      setDeleteError(error.message || 'Failed to delete photo');
      toast.error(error.message || 'Failed to delete photo');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPhotoToDelete(null);
    }
  };

  return (
    <>
      {/* Error message if deletion fails */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          Error: {deleteError}
          <button 
            onClick={() => setDeleteError(null)} 
            className="ml-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
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
              <img 
                src={photo.url} 
                alt={`Event photo ${photo.id}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
              
              {/* Delete button */}
              <button
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-80 focus:opacity-100 z-10"
                onClick={(e) => showDeleteConfirmation(photo, e)}
                disabled={isDeleting}
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
              onClick={(e) => showDeleteConfirmation(selectedPhoto, e)}
              disabled={isDeleting}
              className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-2 z-10 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete photo"
              aria-label="Delete photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            {/* Image container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-h-[80vh]">
              <img 
                src={selectedPhoto.url} 
                alt={`Event photo ${selectedPhoto.id}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete Photo"
        cancelText="Cancel"
        onConfirm={handleDeletePhoto}
        onCancel={closeDeleteConfirmation}
        isProcessing={isDeleting}
      />
    </>
  );
} 