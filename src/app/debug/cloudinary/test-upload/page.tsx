'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function CloudinaryUploadTest() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)} - ${message}`]);
  };

  const handleFileChange = () => {
    setError(null);
    setUploadedUrl(null);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      setError('Please select a file to upload');
      return;
    }

    const file = fileInputRef.current.files[0];
    setUploading(true);
    setError(null);
    setUploadedUrl(null);
    addLog(`Starting upload test for file: ${file.name}`);

    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Get the upload preset from environment variables or use fallback
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'eventpix_uploads';
      formData.append('upload_preset', uploadPreset);
      
      // Add timestamp and folder
      const timestamp = String(Math.round(new Date().getTime() / 1000));
      formData.append('timestamp', timestamp);
      formData.append('folder', 'test_uploads');
      
      // Get cloud name from environment or use fallback
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dov2iujbo';
      
      addLog(`Using cloud name: ${cloudName}`);
      addLog(`Using upload preset: ${uploadPreset}`);
      
      // Log all form data entries for debugging
      for (const pair of formData.entries()) {
        addLog(`Form data: ${pair[0]}: ${pair[1]}`);
      }
      
      // Make the upload request to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      addLog(`Sending request to: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      addLog(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Error response: ${errorText}`);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      addLog(`Upload successful! URL: ${data.secure_url}`);
      setUploadedUrl(data.secure_url);
      
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/debug/cloudinary" 
          className="text-rose-600 hover:text-rose-700 mb-6 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cloudinary Debug
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Cloudinary Upload Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Test Direct Upload to Cloudinary</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            This test will upload an image directly to Cloudinary using the configured preset.
            Check the logs below to see the details of the upload process.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-rose-50 file:text-rose-700
                hover:file:bg-rose-100"
              disabled={uploading}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-rose-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              Error: {error}
            </div>
          )}
          
          {uploadedUrl && (
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-green-700 font-medium">Upload Successful!</p>
                <p className="text-green-700 break-all">{uploadedUrl}</p>
              </div>
              
              <div className="aspect-video relative bg-gray-100 border rounded">
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded image" 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="border rounded bg-gray-50 p-4">
          <h3 className="text-md font-semibold mb-2">Upload Logs</h3>
          <div className="font-mono text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-60">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Start an upload to see details.</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Environment Variables</h3>
        <p className="text-sm mb-2">These should match your Cloudinary configuration:</p>
        <ul className="list-disc list-inside text-sm">
          <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: <span className="font-mono">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}</span></li>
          <li>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: <span className="font-mono">{process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not set'}</span></li>
        </ul>
      </div>
    </div>
  );
} 