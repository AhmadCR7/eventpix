import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
          
          <div className="text-rose-400 font-medium tracking-wider mb-12">
            USE IT FOR PHOTOS + VIDEOS + GUESTBOOK + SLIDESHOW
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/events/create" 
              className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md font-medium"
            >
              Get Started
            </Link>
            
            <Link 
              href="/events" 
              className="bg-white text-rose-700 border border-rose-200 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors shadow-sm hover:shadow-md font-medium"
            >
              View Events
            </Link>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="md:w-1/2 relative">
          <div className="relative h-80 w-full md:h-[450px] rounded-lg overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop" 
              alt="Wedding celebration" 
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Event Types Section */}
      <div className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-rose-400 font-medium tracking-wider mb-8">
            LOVED & USED FOR
          </h2>
          
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop" 
                  alt="Corporate & Business Events" 
                  width={240}
                  height={180}
                  className="object-cover"
                />
              </div>
              <h3 className="font-['Playfair_Display'] font-medium text-gray-800">
                CORPORATE & BUSINESS EVENTS
              </h3>
            </div>
            
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1470&auto=format&fit=crop" 
                  alt="Birthdays" 
                  width={240}
                  height={180}
                  className="object-cover"
                />
              </div>
              <h3 className="font-['Playfair_Display'] font-medium text-gray-800">
                BIRTHDAYS
              </h3>
            </div>
            
            <div className="w-full md:w-64 text-center">
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1470&auto=format&fit=crop" 
                  alt="Engagement Parties" 
                  width={240}
                  height={180}
                  className="object-cover"
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-rose-100 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Create Your Event</h3>
              <p className="text-gray-600">Set up your event details and get a unique QR code for your guests.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-rose-100 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Share With Guests</h3>
              <p className="text-gray-600">Display your QR code at your event for guests to scan and upload photos.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-rose-100 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-800">Enjoy Your Photos</h3>
              <p className="text-gray-600">Access all your photos in one place, download, and share with everyone.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/events/create" 
              className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md font-medium"
            >
              Create Your First Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
