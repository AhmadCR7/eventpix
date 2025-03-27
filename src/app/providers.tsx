'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useState, useEffect } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Handle production environment
    if (process.env.NODE_ENV === 'production') {
      // Save original console methods
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      
      // Only silence non-critical logs in production
      if (typeof window !== 'undefined') {
        // Filter console.log completely in production
        console.log = () => {};
        
        // Keep warnings but filter out common development warnings
        console.warn = (...args) => {
          const warningText = args[0]?.toString() || '';
          
          // Filter out React DevTools and Clerk development warnings
          if (warningText.includes('Download the React DevTools') || 
              warningText.includes('Clerk has been loaded with development keys')) {
            return;
          }
          
          // Allow other warnings to pass through
          originalConsoleWarn.apply(console, args);
        };
        
        // Keep errors but make them more concise
        console.error = (...args) => {
          // Allow error logging but strip lengthy stack traces in production
          if (typeof args[0] === 'object' && args[0] !== null) {
            const error = args[0];
            originalConsoleError.call(console, error.message || 'An error occurred');
          } else {
            originalConsoleError.apply(console, args);
          }
        };
      }
      
      // Restore on unmount
      return () => {
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
      };
    }
    
    setIsMounted(true);
  }, []);

  // Using this pattern to ensure hydration works correctly in Next.js
  if (!isMounted) {
    return null;
  }

  // Configure Clerk options - only use supported properties
  const clerkOptions = {
    appearance: {
      // Hide Clerk development badge in production
      elements: {
        badge: process.env.NODE_ENV === 'production' ? { isHidden: true } : undefined,
        footer: { isHidden: true }
      },
      variables: {
        // Match brand colors
        colorPrimary: '#e11d48', // rose-600
        colorTextOnPrimaryBackground: 'white'
      }
    }
  };

  return (
    <ClerkProvider {...clerkOptions}>
      {/* 
        Note: The following warnings in development mode are normal and won't appear in production:
        - React DevTools message
        - Clerk development keys warning 
        - Next.js Hot Reloader messages
      */}
      {children}
    </ClerkProvider>
  );
} 