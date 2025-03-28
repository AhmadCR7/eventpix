'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CloudinaryDebugPage() {
  const [testUrl, setTestUrl] = useState<string>('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hard-coded test images known to work with Cloudinary
  const testImages = [
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/flowers.jpg',
    'https://res.cloudinary.com/dov2iujbo/image/upload/v1716932399/event_banners/y7m1w2blwxovb2jipvl3.jpg',
  ];

  const handleTestUrl = async () => {
    if (!testUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test if URL is accessible
      const response = await fetch(testUrl, { method: 'HEAD' });
      setTestResults({
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });
    } catch (err: any) {
      setError(err.message || 'Error testing URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-rose-600 hover:text-rose-700 mb-6 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Cloudinary Debug Page</h1>
      
      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Test Your Own Cloudinary URL</h2>
          <Link 
            href="/debug/cloudinary/test-upload" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Test Direct Upload
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text" 
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Paste Cloudinary URL here"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={handleTestUrl}
            disabled={isLoading || !testUrl}
            className="bg-rose-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? 'Testing...' : 'Test URL'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}
        
        {testResults && (
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p><strong>Status:</strong> {testResults.status} ({testResults.ok ? 'OK' : 'Failed'})</p>
              <p><strong>Content Type:</strong> {testResults.contentType || 'Unknown'}</p>
            </div>
            
            {testResults.ok && (
              <div className="space-y-4">
                <h3 className="font-semibold">Rendering Test:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Regular IMG tag:</h4>
                    <div className="aspect-video relative bg-gray-100">
                      <img 
                        src={testUrl} 
                        alt="Test image" 
                        className="object-contain w-full h-full"
                        onLoad={() => console.log('Regular IMG loaded successfully')}
                        onError={() => console.log('Regular IMG failed to load')}
                      />
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Next.js Image component:</h4>
                    <div className="aspect-video relative bg-gray-100">
                      <Image 
                        src={testUrl}
                        alt="Test image"
                        fill
                        className="object-contain"
                        onLoad={() => console.log('Next.js Image loaded successfully')}
                        onError={() => console.log('Next.js Image failed to load')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Test Known Working Cloudinary Images</h2>
        
        <div className="grid grid-cols-1 gap-8">
          {testImages.map((url, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <p className="font-mono text-sm mb-2 break-all">{url}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Regular IMG tag:</h4>
                  <div className="aspect-video relative bg-gray-100">
                    <img 
                      src={url} 
                      alt={`Test image ${index+1}`} 
                      className="object-contain w-full h-full"
                      onLoad={() => console.log(`Regular IMG ${index+1} loaded successfully`)}
                      onError={() => console.log(`Regular IMG ${index+1} failed to load`)}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Next.js Image component:</h4>
                  <div className="aspect-video relative bg-gray-100">
                    <Image 
                      src={url}
                      alt={`Test image ${index+1}`}
                      fill
                      className="object-contain"
                      onLoad={() => console.log(`Next.js Image ${index+1} loaded successfully`)}
                      onError={() => console.log(`Next.js Image ${index+1} failed to load`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 