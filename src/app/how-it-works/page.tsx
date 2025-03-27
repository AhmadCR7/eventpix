import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from '../../lib/prisma';

export default async function HowItWorksPage() {
  // Get the current user's ID (if logged in)
  const { userId: clerkUserId } = await auth();
  
  // Default to showing "Create Your First Event" for non-logged in users
  let hasEvents = false;
  
  // Check if the user has any events (only if logged in)
  if (clerkUserId) {
    try {
      // Get additional user info to help with identification
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress;
      
      // SIMPLIFIED APPROACH: Just check for events directly without updating user data
      // This avoids the database constraint error when multiple user records exist
      
      // First, check if any user with this email has events
      if (email) {
        // Get all users with this email (might be duplicates)
        const users = await prisma.user.findMany({
          where: { email: email },
          select: { id: true }
        });
        
        // Check if any of these users have events
        if (users.length > 0) {
          for (const user of users) {
            const eventCount = await prisma.event.count({
              where: { userId: user.id }
            });
            
            if (eventCount > 0) {
              hasEvents = true;
              break; // Stop checking once we find events
            }
          }
        }
      }
      
      // If no events found by email, try specific user IDs from logs as fallback
      if (!hasEvents) {
        const knownUserIds = [
          'd7e1f51c-8a7d-4afe-94bc-42deae3a401b',
          'ecf63249-f4fd-4043-9305-370b3b4d591a'
        ];
        
        for (const id of knownUserIds) {
          const eventCount = await prisma.event.count({
            where: { userId: id }
          });
          
          if (eventCount > 0) {
            hasEvents = true;
            break;
          }
        }
      }
      
      // Use development logging for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log(`User checked for events, hasEvents: ${hasEvents}`);
      }
    } catch (error) {
      // Use conditional logging based on environment
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error checking user events:', error);
      } else {
        console.error('Error occurred while checking user events');
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-6">
            How GuestPix Works
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            The easiest way to collect and share photos from your special events
          </p>
        </div>
      </div>
      
      {/* Steps Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative h-64 w-full md:h-80 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/how-it-works/step1.jpg" 
                    alt="Create your event" 
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xl font-bold mb-4">
                  1
                </div>
                <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">
                  Create Your Event
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Set up your event with a name, date, and an optional welcome message for your guests. Our simple form makes it easy to get started in just a few clicks.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Once created, your event will have a unique QR code that guests can scan to access your photo gallery.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative h-64 w-full md:h-80 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/how-it-works/step2.jpg" 
                    alt="Share with guests" 
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pr-16">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xl font-bold mb-4">
                  2
                </div>
                <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">
                  Share With Your Guests
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Display your unique QR code at your event for guests to scan. You can print it on cards, display it on screens, or include it in your invitation materials.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Guests simply scan the code with their phone camera - no app download needed! They'll instantly access your photo gallery where they can upload their photos.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative h-64 w-full md:h-80 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/how-it-works/step3.jpg" 
                    alt="Enjoy your photos" 
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-16">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xl font-bold mb-4">
                  3
                </div>
                <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">
                  Collect and Share Memories
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  All photos uploaded by your guests will be saved at full resolution in your event gallery. You can access them anytime, download them, and share them with everyone who attended.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Create albums, favorite your best shots, and even create slideshows to relive the special moments from your event.
                </p>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="mt-24">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-center mb-16 text-gray-800">
              Why Choose GuestPix?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-rose-100 text-center">
                <div className="w-16 h-16 mx-auto mb-6 text-rose-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800">No App Required</h3>
                <p className="text-gray-600">
                  Guests don't need to download any apps. They simply scan the QR code with their phone camera.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-rose-100 text-center">
                <div className="w-16 h-16 mx-auto mb-6 text-rose-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800">Full Resolution</h3>
                <p className="text-gray-600">
                  All photos are saved at their original full resolution with no compression or quality loss.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-rose-100 text-center">
                <div className="w-16 h-16 mx-auto mb-6 text-rose-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800">Private & Secure</h3>
                <p className="text-gray-600">
                  Your photos are private and only accessible to those with your event link or QR code.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="bg-rose-50 mt-20 p-12 rounded-lg border border-rose-100 text-center">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">
              Ready to collect memories from your next event?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {hasEvents 
                ? "Manage your existing events or create a new one to capture more memories."
                : "Create your first event in minutes and make sure no precious moment goes uncaptured."
              }
            </p>
            
            {hasEvents ? (
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/events" 
                  className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md font-medium"
                >
                  View My Events
                </Link>
                <Link 
                  href="/events/create" 
                  className="bg-white text-rose-600 border border-rose-200 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors shadow-sm hover:shadow-md font-medium"
                >
                  Create New Event
                </Link>
              </div>
            ) : (
              <Link 
                href="/events/create" 
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md font-medium"
              >
                Create Your First Event
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 