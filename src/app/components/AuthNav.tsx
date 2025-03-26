'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, UserButton } from "@clerk/nextjs";

export default function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [navReady, setNavReady] = useState(false);

  // Ensure component is mounted before showing authentication-dependent UI
  useEffect(() => {
    setNavReady(true);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-['Playfair_Display'] font-bold text-rose-600">
                guestpix
              </span>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link href="/" className="text-gray-600 hover:text-rose-600 px-3 py-2 font-medium">
                Home
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-rose-600 px-3 py-2 font-medium">
                Events
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-rose-600 px-3 py-2 font-medium">
                How It Works
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {!navReady || !isLoaded ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isSignedIn && user ? (
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.firstName || 'User'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link 
                  href="/sign-in" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Sign in
                </Link>
                <Link 
                  href="/sign-up" 
                  className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 