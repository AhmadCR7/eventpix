'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

export default function EventQRCode({ eventId, eventName }: EventQRCodeProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Set the base URL when the component mounts
  useEffect(() => {
    // Get the base URL dynamically
    const url = window.location.origin;
    setBaseUrl(url);
    // Point to the guest view instead of the regular event view
    setQrValue(`${url}/guest/${eventId}`);
  }, [eventId]);
  
  // Function to download QR code as PNG
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    toast.loading('Preparing QR code download...', { id: 'qr-download' });

    // Create a canvas element to draw our QR code on
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('Could not create QR code image', { id: 'qr-download' });
      return;
    }
    
    // Set canvas dimensions (larger size for better quality)
    canvas.width = 1000;
    canvas.height = 1000;
    
    // Create an image from the SVG
    const img = document.createElement('img');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        // Convert to data URL and download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${eventName.replace(/\s+/g, '-')}-QR-Code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success('QR code downloaded successfully', { id: 'qr-download' });
      } catch (error) {
        toast.error('Failed to download QR code', { id: 'qr-download' });
        console.error('Error downloading QR code:', error);
      }
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
    };
    
    img.onerror = () => {
      toast.error('Failed to create QR code image', { id: 'qr-download' });
    };
    
    img.src = svgUrl;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-rose-100 flex flex-col items-center">
      <h3 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-gray-800">Event QR Code</h3>
      
      <div className="bg-white p-4 rounded-lg shadow-sm" ref={qrRef}>
        {qrValue && (
          <QRCodeSVG 
            value={qrValue} 
            size={200}
            level="H" // High error correction
            includeMargin={true}
          />
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Scan this QR code for your guests to upload photos</p>
        <p className="text-xs mt-1">{qrValue}</p>
      </div>
      
      <button
        onClick={downloadQRCode}
        className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition-colors text-sm font-medium flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR Code
      </button>
    </div>
  );
} 