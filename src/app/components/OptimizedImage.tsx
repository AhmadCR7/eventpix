'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
  onError?: () => void;
  onLoad?: () => void;
};

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fill = false,
  priority = false,
  width,
  height,
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Log image URL when component mounts
  useEffect(() => {
    console.log(`OptimizedImage: Attempting to load image from: ${src}`);
    
    // Test if the image URL is accessible with a HEAD request
    async function testImageUrl() {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`OptimizedImage: HEAD request for ${src} failed with status ${response.status}`);
        } else {
          console.log(`OptimizedImage: HEAD request for ${src} successful`);
        }
      } catch (error) {
        console.error(`OptimizedImage: Failed to test URL: ${src}`, error);
      }
    }
    
    testImageUrl();
  }, [src]);
  
  // Return placeholder if error occurs
  if (isError) {
    return (
      <div className={`bg-rose-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg 
            className="w-10 h-10 text-rose-500 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <p className="text-sm text-rose-700">Image Failed to Load</p>
          <p className="text-xs text-rose-500 mt-1">{src}</p>
        </div>
      </div>
    );
  }
  
  const handleError = () => {
    console.error(`OptimizedImage: Failed to load image: ${src}`);
    setIsError(true);
    // Call the external onError handler if provided
    if (onError) {
      onError();
    }
  };
  
  const handleLoad = () => {
    console.log(`OptimizedImage: Successfully loaded image: ${src}`);
    setIsLoaded(true);
    // Call the external onLoad handler if provided
    if (onLoad) {
      onLoad();
    }
  };
  
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width || 1200}
      height={height || 800}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
} 