import { notFound } from 'next/navigation';
import { getEventById } from '../../lib/events';
import GuestPhotoManager from './GuestPhotoManager';

export default async function GuestUploadPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fix the params.id access by using object destructuring
  const { id } = params;
  const eventId = id;
  
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
          <div className="bg-rose-600 text-white p-6 text-center">
            <h1 className="text-2xl font-['Playfair_Display'] font-bold mb-2">
              {event.name}
            </h1>
            <div className="flex items-center justify-center text-rose-100">
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
              <span>{formatDate(event.date)}</span>
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