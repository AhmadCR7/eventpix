import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getEventById } from '../../lib/events';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import EventActions from './EventActions';
import EventQRCode from './EventQRCode';
import PhotoManager from './PhotoManager';
import Guestbook from './Guestbook';

export default async function EventPage({ params }: { params: { id: string } }) {
  // Get authentication session
  const session = await auth();
  
  // If user is not signed in, redirect to sign in page
  if (!session) {
    redirect('/auth/signin?callbackUrl=/events');
  }

  // Await the id parameter as required by Next.js 15
  const eventId = await params.id;

  try {
    // Get event details
    const event = await getEventById(eventId);
    
    if (!event) {
      notFound();
    }

    // If event is private and user is not the host or admin, check for cookie
    const isAdmin = session?.user?.role === 'ADMIN';
    // Use userId as the hostId since that's how our database is structured
    const isHost = event.userId === session?.user?.id;
    
    // Only check for verification if user is not admin or host
    if (event.private && !isHost && !isAdmin) {
      // For private events that aren't owned by this user, verify access
      const verificationCookieName = `event-${eventId}-verification`;
      
      // We need to redirect to verification page
      // Note: In server components, we don't need to check cookies directly
      // We can just redirect to the verification page which will handle the checks
      redirect(`/events/${eventId}/verify`);
    }

    // Format the date for display
    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate a gradient background based on event name
    const getGradient = (name: string) => {
      // Simple hash function to generate consistent colors for the same event name
      const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
      const hue = hash % 360;
      return `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 60) % 360}, 80%, 60%))`;
    };

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
                <div className="h-48 relative" style={{ background: getGradient(event.name) }}>
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div>
                        <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-sm">{event.name}</h1>
                        <div className="flex items-center text-white">
                          <svg 
                            className="w-5 h-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="drop-shadow-sm">{formatDate(event.date)}</span>
                        </div>
                      </div>
                      
                      {canManageEvent && (
                        <div className="z-10">
                          <EventActions 
                            eventId={event.id} 
                            eventName={event.name} 
                            isAdmin={isAdmin} 
                            isOwner={isHost} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
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
                  
                  <Guestbook eventId={event.id} />
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
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Return to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 