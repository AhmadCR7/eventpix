'use client';

import { useState } from 'react';
import { addPhotoToEvent } from '../../lib/events';

interface AddPlaceholderPhotoProps {
  eventId: string;
  onPhotoAdded: () => void;
}

export default function AddPlaceholderPhoto({ eventId, onPhotoAdded }: AddPlaceholderPhotoProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddPhoto = async () => {
    setIsLoading(true);
    try {
      // Create placeholder photo URL with random size for variety
      const width = Math.floor(Math.random() * 200) + 300; // 300-500px width
      const height = Math.floor(Math.random() * 200) + 200; // 200-400px height
      const placeholderUrl = `https://via.placeholder.com/${width}x${height}`;
      
      await addPhotoToEvent(eventId, placeholderUrl);
      onPhotoAdded();
    } catch (error) {
      console.error('Error adding placeholder photo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleAddPhoto}
      disabled={isLoading}
      className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors shadow-sm disabled:bg-rose-400 text-sm font-medium"
    >
      {isLoading ? 'Adding...' : 'Add Placeholder Photo'}
    </button>
  );
} 