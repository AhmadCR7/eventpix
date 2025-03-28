'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface UploadPhotoProps {
  eventId: string;
  onPhotoUploaded: () => void;
}

export default function UploadPhoto({ eventId, onPhotoUploaded }: UploadPhotoProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Start upload immediately
    await uploadFiles(files);
    
    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const uploadFiles = async (files: FileList) => {
    setIsUploading(true);
    setTotalFiles(files.length);
    setCurrentFileIndex(0);
    
    toast.loading(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`, { id: 'upload-toast' });
    
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i + 1);
      setUploadProgress(0);
      
      try {
        // Create form data for this file
        const formData = new FormData();
        formData.append('file', file);
        
        setUploadProgress(20);
        
        // Upload to our API endpoint
        const response = await fetch(`/api/events/${eventId}/photos`, {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(90);
        
        if (!response.ok) {
          // Try to get error details from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `Upload failed with status ${response.status}`;
          toast.error(`Error uploading ${file.name}: ${errorMessage}`, { id: 'upload-toast' });
          continue; // Try next file
        }
        
        const result = await response.json();
        uploadedFiles.push(result);
        setUploadProgress(100);
        
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message || 'Unknown error'}`, { id: 'upload-toast' });
      }
    }
    
    // All done
    setIsUploading(false);
    
    // Display success message based on results
    if (uploadedFiles.length === files.length) {
      toast.success(`All ${files.length} photos uploaded successfully!`, { id: 'upload-toast' });
    } else if (uploadedFiles.length > 0) {
      toast.success(`${uploadedFiles.length} of ${files.length} photos uploaded successfully.`, { id: 'upload-toast' });
    } else {
      toast.error('Failed to upload any photos. Please try again.', { id: 'upload-toast' });
    }
    
    // Notify parent component to refresh the gallery
    onPhotoUploaded();
  };

  const getProgressLabel = () => {
    if (totalFiles > 1) {
      return `Uploading file ${currentFileIndex}/${totalFiles} (${uploadProgress}%)`;
    }
    return `Uploading... ${uploadProgress}%`;
  };

  return (
    <div className="mb-8">
      <div className="relative">
        <label 
          htmlFor="photo-upload" 
          className={`flex items-center justify-center w-full px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-sm text-gray-700 font-medium">
              {isUploading ? getProgressLabel() : "Click to select photos to upload"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Photos will be uploaded automatically
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        
        {/* Progress bar */}
        {isUploading && (
          <div className="w-full mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-rose-600 h-full transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 