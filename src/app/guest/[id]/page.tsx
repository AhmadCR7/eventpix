import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getEventById } from '../../lib/events';
import GuestPhotoManager from './GuestPhotoManager';

export default async function GuestUploadPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Access the event ID directly from params (not a Promise in Next.js 15)
  const eventId = params.id;
  
  // Get the event by ID
  const event = await getEventById(eventId);
  
  // If event not found, show 404
  if (!event) {
    notFound();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
          <div className="h-48 relative">
            {event.bannerUrl ? (
              <Image 
                src={event.bannerUrl}
                alt={`${event.name} banner`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div style={{ background: getGradient(event.name) }} className="w-full h-full"></div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              <h1 className="text-3xl font-bold mb-2 text-center drop-shadow-md">
                {event.name}
              </h1>
              <div className="flex items-center justify-center text-white">
                <svg 
                  className="w-4 h-4 mr-2" 
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
          </div>
          
          <div className="p-6">
            {event.welcomeMessage && (
              <div className="mb-8">
                <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {event.welcomeMessage}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <GuestPhotoManager eventId={eventId} eventName={event.name} />
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>Powered by GuestPix</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 