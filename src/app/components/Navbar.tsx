'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const [pricingDropdownOpen, setPricingDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string): boolean => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-slate-900 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-['Playfair_Display'] font-bold text-rose-300 hover:text-rose-200">
            guestpix
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Events Dropdown */}
          <div className="relative">
            <button 
              className={`flex items-center text-white hover:text-rose-200 transition-colors ${isActive('/events') ? 'text-rose-300' : ''}`}
              onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
              onBlur={() => setTimeout(() => setEventsDropdownOpen(false), 200)}
            >
              Events
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {eventsDropdownOpen && (
              <div className="absolute z-10 left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-2">
                  <Link 
                    href="/events" 
                    className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setEventsDropdownOpen(false)}
                  >
                    View All Events
                  </Link>
                  <Link 
                    href="/events/create" 
                    className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setEventsDropdownOpen(false)}
                  >
                    Create New Event
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link 
            href="/how-it-works"
            className={`text-white hover:text-rose-200 transition-colors ${isActive('/how-it-works') ? 'text-rose-300' : ''}`}
          >
            How It Works
          </Link>
          
          {/* Pricing Dropdown */}
          <div className="relative">
            <button 
              className={`flex items-center text-white hover:text-rose-200 transition-colors ${isActive('/pricing') ? 'text-rose-300' : ''}`}
              onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
              onBlur={() => setTimeout(() => setPricingDropdownOpen(false), 200)}
            >
              Pricing
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {pricingDropdownOpen && (
              <div className="absolute z-10 left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-2">
                  <Link 
                    href="/pricing/basic" 
                    className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setPricingDropdownOpen(false)}
                  >
                    Basic Package
                  </Link>
                  <Link 
                    href="/pricing/premium" 
                    className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setPricingDropdownOpen(false)}
                  >
                    Premium Package
                  </Link>
                  <Link 
                    href="/pricing/enterprise" 
                    className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setPricingDropdownOpen(false)}
                  >
                    Enterprise Solutions
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link 
            href="/about"
            className={`text-white hover:text-rose-200 transition-colors ${isActive('/about') ? 'text-rose-300' : ''}`}
          >
            About Us
          </Link>
          
          <Link 
            href="/help"
            className={`text-white hover:text-rose-200 transition-colors ${isActive('/help') ? 'text-rose-300' : ''}`}
          >
            Help Center
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Auth Buttons */}
          {status === 'authenticated' ? (
            <div className="relative">
              <button 
                className="text-white hover:text-rose-200 transition-colors flex items-center"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                aria-label="User Account"
              >
                <span className="mr-2 hidden sm:inline">{session?.user?.name}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button 
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                href="/auth/signin" 
                className="text-white hover:text-rose-200 transition-colors hidden sm:inline-block"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-white text-rose-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium hidden md:block"
              >
                Sign Up
              </Link>
            </>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white hover:text-rose-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 mt-4 pb-4 px-4">
          <div className="flex flex-col space-y-3 pt-3">
            <Link 
              href="/events"
              className="text-white hover:text-rose-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/how-it-works"
              className="text-white hover:text-rose-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/pricing"
              className="text-white hover:text-rose-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about"
              className="text-white hover:text-rose-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/help"
              className="text-white hover:text-rose-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help Center
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/dashboard"
                  className="text-white hover:text-rose-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-white hover:text-rose-200 py-2 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="inline-block bg-transparent border border-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="inline-block bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 