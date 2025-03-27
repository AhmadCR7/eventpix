import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import MemorialSlider from "./components/MemorialSlider";
import { getAllEvents } from "./lib/events";
import { getCurrentUserId } from "./lib/user";

export default async function Home() {
  // Get authentication with Clerk
  const { userId } = await auth();
  
  // Check if user has events
  let hasEvents = false;
  
  if (userId) {
    try {
      // Get the database user ID
      const dbUserId = await getCurrentUserId();
      
      if (dbUserId) {
        // Get all events for this user
        const events = await getAllEvents(dbUserId);
        hasEvents = events.length > 0;
      }
    } catch (error) {
      console.error("Error checking for user events:", error);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between py-16 px-4">
        {/* Left side - Text content */}
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-gray-800 mb-6 leading-tight">
            It's all done for you.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            We instantly create a private QR code for your event that saves 
            all full resolution photos to your live photo gallery or albums.
          </p>
          <p className="text-2xl font-['Playfair_Display'] font-medium text-gray-800 mb-10">
            No App. No Fuss.
          </p>
          
          <div className="text-gray-500 font-medium tracking-wider mb-12">
            USE IT FOR PHOTOS + VIDEOS + SLIDESHOW
          </div>
          
          <div className="flex space-x-4">
            {userId ? (
              hasEvents ? (
                <Link 
                  href="/events" 
                  className="btn-primary"
                >
                  My Events
                </Link>
              ) : (
                <Link 
                  href="/events/create" 
                  className="btn-primary"
                >
                  Create Your First Event
                </Link>
              )
            ) : (
              <Link 
                href="/sign-up" 
                className="btn-primary"
              >
                Get Started
              </Link>
            )}
            
            {userId && hasEvents && (
              <Link 
                href="/events/create" 
                className="btn-outline"
              >
                Create New Event
              </Link>
            )}
            
            {!userId && (
              <Link 
                href="/sign-in" 
                className="btn-outline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="md:w-1/2 relative">
          <div className="relative h-80 w-full md:h-[450px] rounded-lg overflow-hidden">
            <Image 
              src="/images/events/hero.jpg" 
              alt="Wedding celebration" 
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* Memorial Slider Section */}
      <MemorialSlider />
      
      {/* Event Types Section */}
      <div className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-gray-500 font-medium tracking-wider mb-8">
            LOVED & USED FOR
          </h2>
          
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/images/events/business.jpg" 
                  alt="Corporate & Business Events" 
                  width={240}
                  height={240}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="font-['Playfair_Display'] font-medium text-gray-800">
                CORPORATE & BUSINESS EVENTS
              </h3>
            </div>
            
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/images/events/birthday.jpg" 
                  alt="Birthdays" 
                  width={240}
                  height={240}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="font-['Playfair_Display'] font-medium text-gray-800">
                BIRTHDAYS
              </h3>
            </div>
            
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/images/events/engagement.jpg" 
                  alt="Engagement Parties" 
                  width={240}
                  height={240}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="font-['Playfair_Display'] font-medium text-gray-800">
                ENGAGEMENT PARTIES
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="w-full py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="surface-card">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 rounded-full" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-primary-dark)' }}>
                1
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Create Your Event</h3>
              <p className="text-gray-600">Set up your event details and get a unique QR code for your guests.</p>
            </div>
            
            <div className="surface-card">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 rounded-full" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-primary-dark)' }}>
                2
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Share With Guests</h3>
              <p className="text-gray-600">Display your QR code at your event for guests to scan and upload photos.</p>
            </div>
            
            <div className="surface-card">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 rounded-full" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-primary-dark)' }}>
                3
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Enjoy Your Photos</h3>
              <p className="text-gray-600">Access all your photos in one place, download, and share with everyone.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            {userId ? (
              hasEvents ? (
                <Link 
                  href="/events" 
                  className="btn-primary"
                >
                  Go to My Events
                </Link>
              ) : (
                <Link 
                  href="/events/create" 
                  className="btn-primary"
                >
                  Create Your First Event
                </Link>
              )
            ) : (
              <Link 
                href="/sign-up" 
                className="btn-primary"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Cloudinary Image Test */}
      <div className="max-w-5xl w-full mt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Cloudinary Image Test</h2>
          <p className="mb-4">If you can see the sample images below, Cloudinary is configured correctly:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <p className="mb-2">Sample Image 1 (Direct Cloudinary URL):</p>
              <Image 
                src="https://res.cloudinary.com/dov2iujbo/image/upload/v1716932399/event_banners/y7m1w2blwxovb2jipvl3.jpg" 
                alt="Sample 1" 
                fill 
                className="object-cover" 
              />
            </div>
            
            <div className="relative h-64 rounded-lg overflow-hidden">
              <p className="mb-2">Sample Image 2 (Direct Cloudinary URL):</p>
              <Image 
                src="https://res.cloudinary.com/dov2iujbo/image/upload/v1716932499/event_banners/ffxn5pgtkiuocidq5u0w.jpg" 
                alt="Sample 2" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
