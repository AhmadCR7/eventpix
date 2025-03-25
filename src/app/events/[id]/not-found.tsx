import Link from 'next/link';

export default function EventNotFound() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-rose-100 p-12 text-center">
        <svg 
          className="w-20 h-20 text-rose-500 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-4 text-gray-800">Event Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          We couldn't find the event you're looking for.
        </p>
        <Link 
          href="/events" 
          className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
        >
          Back to All Events
        </Link>
      </div>
    </div>
  );
} 