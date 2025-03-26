import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserId, debugUserInfo } from '../lib/user';
import { getAllEvents } from '../lib/events';

// Enhanced Event Card component with better styling
function EventCard({ event }: { event: any }) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate welcome message for display if it's too long
  const truncateMessage = (message: string | null, maxLength: number = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  // Generate a gradient background based on event name
  const getGradient = (name: string) => {
    // Simple hash function to generate consistent colors for the same event name
    const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 60) % 360}, 80%, 60%))`;
  };

  return (
    <Link key={event.id} href={`/events/${event.id}`}>
      <div className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col transform hover:-translate-y-1">
        <div className="relative h-40" style={{ background: getGradient(event.name) }}>
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="font-bold text-2xl mb-1 drop-shadow-sm truncate">{event.name}</h2>
            <div className="flex items-center text-white text-sm drop-shadow-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>
        <div className="p-6 flex-grow">
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {truncateMessage(event.welcomeMessage)}
          </p>
          {event.private && (
            <div className="flex items-center text-gray-600 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private Event</span>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="text-rose-600 font-medium text-sm group-hover:text-rose-700 flex items-center">
            <span>View Details</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  // Get authentication with Clerk
  const { userId } = await auth();
  
  // If user is not signed in, redirect to sign in page
  if (!userId) {
    redirect('/sign-in?redirect_url=/events');
  }

  // Debug user information
  await debugUserInfo();

  // Get the database user ID
  const dbUserId = await getCurrentUserId();
  
  console.log('Events page - dbUserId:', dbUserId);
  
  // For now, hardcode isAdmin to false (you may want to implement admin role checking)
  const isAdmin = false;

  // Get events for the authenticated user (or all events if admin)
  const events = await getAllEvents(dbUserId || undefined, isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isAdmin ? 'All Events' : 'Your Events'}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {isAdmin 
                ? 'Manage all events across the platform' 
                : 'Create and manage your event galleries, guestbooks, and more'}
            </p>
            <Link 
              href="/events/create" 
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-6 rounded-full inline-flex items-center transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Event
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">No events found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {isAdmin 
                  ? 'There are no events in the system yet.' 
                  : 'Create your first event to start collecting memories!'}
              </p>
              <Link
                href="/events/create"
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-6 rounded-full inline-flex items-center transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 