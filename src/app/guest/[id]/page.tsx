import { notFound } from 'next/navigation';
import { getEventById } from '../../lib/events';
import GuestPhotoManager from './GuestPhotoManager';
import GuestBanner from './GuestBanner';

export default async function GuestUploadPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Access the event ID using Promise.resolve to properly handle it in an async context
  const eventId = await Promise.resolve(params.id);
  console.log('Guest Upload Page - Event ID:', eventId);
  
  // Get the event by ID
  const event = await getEventById(eventId);
  
  // If event not found, show 404
  if (!event) {
    notFound();
  }
  
  // For debugging, log the banner URL
  if (event.bannerUrl) {
    console.log('Guest page - Found event with banner URL:', event.bannerUrl);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
          <GuestBanner
            bannerUrl={event.bannerUrl || null}
            eventName={event.name}
            eventDate={event.date}
          />
          
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