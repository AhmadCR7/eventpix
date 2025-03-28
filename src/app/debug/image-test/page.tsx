'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import OptimizedImage from '@/app/components/OptimizedImage';
import Link from 'next/link';

export default function ImageTestPage() {
  const [imageUrl, setImageUrl] = useState('https://res.cloudinary.com/dov2iujbo/image/upload/v1743093944/event_banners/bnqinbetf3nhwfgnrxfg.jpg');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
    console.log(message);
  };
  
  // Test the image URL with a fetch HEAD request
  useEffect(() => {
    const testImageUrl = async () => {
      addLog(`Testing image URL: ${imageUrl}`);
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          addLog(`HEAD request successful: ${response.status} ${response.statusText}`);
          // Get content type
          const contentType = response.headers.get('content-type');
          addLog(`Content-Type: ${contentType}`);
        } else {
          addLog(`HEAD request failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        addLog(`Error testing URL: ${error}`);
      }
    };
    
    testImageUrl();
  }, [imageUrl]);
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };
  
  // Handle image load success
  const handleImageLoad = (method: string) => {
    addLog(`✅ Image loaded successfully using ${method}`);
  };
  
  // Handle image load error
  const handleImageError = (method: string) => {
    addLog(`❌ Image failed to load using ${method}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Image Display Test Page</h1>
      
      <Link href="/events" className="text-blue-500 hover:underline mb-4 inline-block">
        Back to Events
      </Link>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Image URL</h2>
        <input 
          type="text" 
          value={imageUrl} 
          onChange={handleImageUrlChange}
          className="w-full p-2 border rounded mb-4"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Method 1: Basic HTML img tag */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 1: HTML img Tag</h3>
            <div className="h-48 relative bg-gray-100">
              <img 
                src={imageUrl} 
                alt="Test Image (HTML)" 
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad('HTML img')}
                onError={() => handleImageError('HTML img')}
              />
            </div>
          </div>
          
          {/* Method 2: CSS Background Image */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 2: CSS Background</h3>
            <div 
              className="h-48 bg-cover bg-center bg-gray-100" 
              style={{ backgroundImage: `url(${imageUrl})` }}
              onLoad={() => handleImageLoad('CSS Background')}
              onError={() => handleImageError('CSS Background')}
            ></div>
          </div>
          
          {/* Method 3: Next.js Image Component */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 3: Next.js Image</h3>
            <div className="h-48 relative bg-gray-100">
              <OptimizedImage 
                src={imageUrl} 
                alt="Test Image (Next.js)" 
                fill 
                className="object-cover"
                onError={() => handleImageError('Next.js Image')}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
        <h2 className="text-white text-lg mb-2">Logs</h2>
        {logMessages.map((message, index) => (
          <div key={index} className="mb-1">{message}</div>
        ))}
      </div>
      
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h2 className="font-semibold text-yellow-700 mb-2">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 text-yellow-800">
          <li>If the image loads in methods 1 or 2 but not in method 3, the issue is likely with Next.js Image configuration.</li>
          <li>If the image doesn't load in any method, the issue might be with the image URL or CORS settings.</li>
          <li>Check the browser's network tab for more details about any failed requests.</li>
        </ul>
      </div>
    </div>
  );
} 