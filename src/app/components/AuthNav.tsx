'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

export default function AuthNav() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAuthenticated = status === 'authenticated' && session?.user;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      {session?.user?.image ? (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || 'Profile picture'} 
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-rose-100 flex items-center justify-center text-rose-500 font-semibold">
                          {session?.user?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 hidden md:block text-sm font-medium text-gray-700">
                      {session?.user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <svg 
                      className="h-5 w-5 ml-1 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </Link>
                    <Link href="/events/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Create Event
                    </Link>
                    <Link href="/events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Events
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link 
                  href="/auth/signin" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 