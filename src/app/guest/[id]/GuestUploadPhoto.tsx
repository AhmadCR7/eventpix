'use client';

import { useState, useRef, useEffect } from 'react';
import ThankYou from './ThankYou';

interface GuestUploadPhotoProps {
  eventId: string;
  eventName: string;
  uploaderName?: string;
  onPhotoUploaded?: () => void;
}

export default function GuestUploadPhoto({ 
  eventId, 
  eventName, 
  uploaderName = '',
  onPhotoUploaded 
}: GuestUploadPhotoProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const addDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[Debug] ${timestamp}: ${message}`); // Also log to console for easier debugging
  };

  // Reset thank you message when component mounts
  useEffect(() => {
    setShowThankYou(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      addDebug(`Selected ${files.length} file(s): ${files.map(f => f.name).join(', ')}`);
      
      // Automatically start the upload when files are selected
      if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  const uploadSingleFile = async (file: File): Promise<boolean> => {
    // File validation
    if (!file.type.startsWith('image/')) {
      addDebug(`Skipping non-image file: ${file.name}`);
      return false;
    }
    
    // Size validation (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      addDebug(`File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
      return false;
    }
    
    addDebug(`Uploading file: ${file.name}`);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Add uploader name if provided
      if (uploaderName) {
        formData.append('uploaderName', uploaderName);
        addDebug(`Including uploader name: ${uploaderName}`);
      }
      
      // Use fetch to upload
      const response = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      addDebug(`Response status for ${file.name}: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }
      
      const result = await response.json();
      addDebug(`Upload successful for ${file.name}: ${result.url}`);
      return true;
    } catch (err: any) {
      addDebug(`Error with ${file.name}: ${err.message}`);
      return false;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setProgress(0);
    setUploadedCount(0);
    setShowThankYou(false); // Ensure thank you message is hidden when starting a new upload
    
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError('Please select a photo to upload');
      return;
    }
    
    const files = Array.from(fileInput.files);
    setTotalFiles(files.length);
    
    setIsUploading(true);
    addDebug(`Starting upload for event: ${eventId}`);
    addDebug(`Preparing to upload ${files.length} file(s)`);
    
    try {
      let successCount = 0;
      
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const success = await uploadSingleFile(file);
        
        if (success) {
          successCount++;
          setUploadedCount(prev => prev + 1);
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      // Reset form
      if (fileInput) {
        fileInput.value = '';
      }
      
      if (successCount > 0) {
        addDebug(`Successfully uploaded ${successCount} of ${files.length} files`);
        
        // Call the onPhotoUploaded callback if provided
        if (onPhotoUploaded) {
          onPhotoUploaded();
        }
        
        // Force show the thank you message with a small delay to ensure React has updated the state
        setTimeout(() => {
          setShowThankYou(true);
          addDebug('Setting showThankYou to true');
        }, 100);
      } else {
        setError('No photos were uploaded. Please try again.');
      }
      
    } catch (err: any) {
      addDebug(`Error during upload: ${err.message}`);
      setError(`Failed to upload photos: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getProgressLabel = () => {
    if (totalFiles > 1) {
      return `Uploading ${uploadedCount}/${totalFiles} photos...`;
    }
    
    if (progress <= 0) return 'Starting...';
    if (progress >= 100) return 'Processing...';
    return `${Math.round(progress)}%`;
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleUpload} className="w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
              multiple // Allow multiple file selection
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin w-12 h-12 text-rose-500 mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-rose-600 font-medium">{getProgressLabel()}</p>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-700 font-medium">Tap to add photos</p>
                <p className="text-gray-500 text-sm mt-1">Select multiple photos at once</p>
                <p className="text-gray-500 text-sm">JPG, PNG, GIF up to 10MB each</p>
              </>
            )}
          </div>
        </div>
      </form>
      
      {/* Only render ThankYou when showThankYou is true */}
      {showThankYou && (
        <ThankYou 
          eventName={eventName} 
          show={showThankYou} 
        />
      )}
    </>
  );
} 