'use client';

import { useState } from 'react';

interface UploadPhotoProps {
  eventId: string;
  onPhotoUploaded: () => void;
}

export default function UploadPhoto({ eventId, onPhotoUploaded }: UploadPhotoProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);
  const [fileList, setFileList] = useState<string[]>([]);
  
  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset messages when files are selected
    setError(null);
    setSuccessMessage(null);
    
    // Get file list and display selected files
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name);
      setFileList(fileNames);
      addDebug(`Selected ${files.length} file(s): ${fileNames.join(', ')}`);
    } else {
      setFileList([]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    const files = fileInput?.files;
    
    if (!files || files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    addDebug(`Starting upload for event: ${eventId}`);
    
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setTotalFiles(files.length);
    setCurrentFileIndex(0);
    
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i + 1);
      setUploadProgress(0);
      
      try {
        // Create form data for this file
        const formData = new FormData();
        formData.append('file', file);
        
        addDebug(`Preparing to upload file ${i + 1}/${files.length}: ${file.name}`);
        setUploadProgress(10);
        
        // Upload to our API endpoint
        const response = await fetch(`/api/events/${eventId}/photos`, {
          method: 'POST',
          body: formData,
        });
        
        addDebug(`Response status for ${file.name}: ${response.status}`);
        setUploadProgress(90);
        
        if (!response.ok) {
          // Try to get error details from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || `Upload failed with status ${response.status}`;
          setError(`Error uploading ${file.name}: ${errorMessage}`);
          addDebug(`Error with ${file.name}: ${errorMessage}`);
          continue; // Try next file
        }
        
        const result = await response.json();
        uploadedFiles.push(result);
        
        // Success for this file!
        addDebug(`Upload successful for ${file.name}!`);
        setUploadProgress(100);
        
      } catch (err: any) {
        setError(`Failed to upload ${file.name}: ${err.message || 'Unknown error'}`);
        addDebug(`Caught error with ${file.name}: ${err.message}`);
      }
    }
    
    // All done
    setIsUploading(false);
    
    // Display success message based on results
    if (uploadedFiles.length === files.length) {
      setSuccessMessage(`All ${files.length} photos uploaded successfully!`);
    } else if (uploadedFiles.length > 0) {
      setSuccessMessage(`${uploadedFiles.length} of ${files.length} photos uploaded successfully.`);
    } else {
      setError('Failed to upload any photos. Please try again.');
    }
    
    // Reset form
    fileInput.value = '';
    setFileList([]);
    
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
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-md file:text-sm file:font-medium file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isUploading || fileList.length === 0}
            className="px-6 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? getProgressLabel() : 'Upload Photos'}
          </button>
        </div>
        
        {fileList.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-1">Selected files:</div>
            <ul className="text-xs text-gray-600 space-y-1">
              {fileList.map((name, i) => (
                <li key={i} className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-4.5-8.599A5.5 5.5 0 003 15z"></path>
                  </svg>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {successMessage && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            Error: {error}
          </div>
        )}
        
        {debug.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono">
            <div className="text-gray-500 mb-1">Debug info:</div>
            {debug.map((msg, i) => (
              <div key={i} className="text-gray-700">{msg}</div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
} 