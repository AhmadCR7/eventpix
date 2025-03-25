'use client';

import { useState, useEffect } from 'react';

interface ThankYouProps {
  eventName: string;
  show: boolean;
}

export default function ThankYou({ eventName, show }: ThankYouProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Ensure component reacts to show prop changes
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      console.log('ThankYou component is now visible');
    }
  }, [show]);
  
  // Disable body scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);
  
  // Now we can have the conditional return after all hooks
  if (!isVisible) return null;
  
  const handleClose = () => {
    setIsVisible(false);
    // Add slight delay before resetting completely
    setTimeout(() => {
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    }, 300);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose} // Close when clicking outside
    >
      <div 
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
        
        <div className="text-center">
          <svg 
            className="w-16 h-16 text-green-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">
            Your photos have been uploaded to "{eventName}" successfully.
          </p>
          <p className="text-gray-500 text-sm">
            You can upload more photos if you'd like.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            Upload More Photos
          </button>
        </div>
      </div>
    </div>
  );
} 