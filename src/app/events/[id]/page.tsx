import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getEventById } from '../../lib/events';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserId } from '../../lib/user';
import EventQRCode from './EventQRCode';
import PhotoManager from './PhotoManager';
import EventBanner from './EventBanner';
import DeleteButton from './DeleteButton';

interface PageParams {
  params: { id: string };
}

export default async function EventPage({ params }: PageParams) {
  // Get authentication from Clerk
  const { userId: clerkUserId } = await auth();
  
  // If user is not signed in, redirect to sign in page
  if (!clerkUserId) {
    redirect('/sign-in?redirect_url=/events');
  }

  // Get the database user ID from Clerk user
  const dbUserId = await getCurrentUserId();

  try {
    // Extract event ID - properly awaiting params as required by Next.js
    const eventId = await Promise.resolve(params.id);
    console.log('Event ID:', eventId);
    
    // Get event details
    const event = await getEventById(eventId);
    
    // If event not found, show 404
    if (!event) {
      notFound();
    }

    // For debugging, log the banner URL
    if (event.bannerUrl) {
      console.log('Found event with banner URL:', event.bannerUrl);
    }

    // For now, hardcode isAdmin to false until we implement admin roles with Clerk
    const isAdmin = false;
    // Check if the user is the owner of this event
    const isHost = event.userId === dbUserId;
    
    // Only check for verification if user is not admin or host
    if (event.private && !isHost && !isAdmin) {
      // For private events that aren't owned by this user, verify access
      const verificationCookieName = `event-${eventId}-verification`;
      
      // We need to redirect to verification page
      // Note: In server components, we don't need to check cookies directly
      // We can just redirect to the verification page which will handle the checks
      redirect(`/events/${eventId}/verify`);
    }

    // Calculate if user can manage the event (admin or host)
    const canManageEvent = isAdmin || isHost;

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-10">      
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <Link 
                href="/events" 
                className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Events
              </Link>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <EventBanner 
                  bannerUrl={event.bannerUrl || null}
                  eventName={event.name}
                  eventDate={event.date}
                  canManageEvent={canManageEvent}
                  isAdmin={isAdmin}
                  isHost={isHost}
                  eventId={event.id}
                />
                
                {event.welcomeMessage && (
                  <div className="p-8 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome Message</h2>
                    <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {event.welcomeMessage}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="mb-12">
                    <EventQRCode eventId={event.id} eventName={event.name} />
                  </div>
                  
                  <PhotoManager eventId={event.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading event:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading event</h1>
            <p className="text-gray-700 mb-6">Failed to load event details. Please try again later.</p>
            <Link 
              href="/events" 
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Return to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 