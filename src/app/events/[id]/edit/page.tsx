'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { getEventById, updateEvent } from '../../../lib/events';
import Alert from '../../../components/Alert';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: PageParams) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { id: eventId } = React.use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    welcomeMessage: '',
    description: '',
    bannerUrl: '',
  });
  
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load event data on component mount
  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getEventById(eventId);
        
        if (event) {
          // Format date for input field (YYYY-MM-DD)
          const formattedDate = new Date(event.date).toISOString().split('T')[0];
          
          setEventData({
            name: event.name,
            date: formattedDate,
            welcomeMessage: event.welcomeMessage || '',
            description: event.description || '',
            bannerUrl: event.bannerUrl || '',
          });
          
          // Set banner preview if there's a banner URL
          if (event.bannerUrl) {
            setBannerPreview(event.bannerUrl);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEvent();
  }, [eventId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        setBannerImage(file);
        
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        setBannerPreview(previewUrl);
        
        // Show the cropper
        setShowCropper(true);
      }
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleBannerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeBanner = () => {
    setBannerImage(null);
    setBannerPreview(null);
    setShowCropper(false);
    setEventData(prev => ({
      ...prev,
      bannerUrl: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!bannerPreview || !croppedAreaPixels) return null;
    
    try {
      const image = document.createElement('img');
      image.src = bannerPreview;
      
      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Set canvas size to desired output size
      canvas.width = 1200;  // Recommended banner width
      canvas.height = 400;  // Recommended banner height
      
      // Draw the cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
      });
      
      if (!blob) return null;
      
      // Create a File from Blob
      const croppedFile = new File([blob], bannerImage?.name || 'banner.jpg', { type: 'image/jpeg' });
      
      // Set the cropped file as the banner image
      setBannerImage(croppedFile);
      
      // Update preview with cropped image
      const croppedUrl = URL.createObjectURL(blob);
      setBannerPreview(croppedUrl);
      
      // Hide cropper
      setShowCropper(false);
      
      return croppedFile;
    } catch (error) {
      console.error('Error creating cropped image:', error);
      return null;
    }
  };
  
  // Upload banner image to Cloudinary
  const uploadBannerToCloudinary = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return eventData.bannerUrl;
    
    setUploadingBanner(true);
    toast.loading('Uploading banner image...', { id: 'upload-banner' });
    
    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // Use the environment variable for upload preset with a fallback
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'eventpix_uploads';
      formData.append('upload_preset', uploadPreset);
      
      // Add timestamp and organize in event_banners folder
      formData.append('timestamp', String(Math.round(new Date().getTime() / 1000)));
      formData.append('folder', 'event_banners');
      
      // Get cloudinary cloud name from env or use fallback
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dov2iujbo';
      
      console.log(`Uploading to Cloudinary (${cloudName}) with preset: ${uploadPreset}...`);
      console.log('Upload file name:', imageFile.name);
      console.log('Upload file size:', imageFile.size);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      // Handle non-success responses
      if (!response.ok) {
        // Try to get more detailed error info
        const errorData = await response.text();
        console.error('Cloudinary error response:', errorData);
        
        // Provide more helpful error message based on response
        if (response.status === 400) {
          throw new Error('Upload failed: Make sure your Cloudinary upload preset is configured correctly and set to "Unsigned"');
        }
        throw new Error(`Failed to upload banner image: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Cloudinary upload successful, full response:', data);
      console.log('Image URL:', data.secure_url);
      console.log('Public ID:', data.public_id);
      toast.success('Banner uploaded successfully', { id: 'upload-banner' });
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner image. Check your Cloudinary configuration.', { id: 'upload-banner' });
      setError('Failed to upload banner image');
      return null;
    } finally {
      setUploadingBanner(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    toast.loading('Updating event...', { id: 'update-event' });
    
    try {
      // Validate inputs
      if (!eventData.name.trim()) {
        toast.error('Event name is required', { id: 'update-event' });
        setError('Event name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!eventData.date) {
        toast.error('Event date is required', { id: 'update-event' });
        setError('Event date is required');
        setIsSubmitting(false);
        return;
      }
      
      // Process the cropped image if cropper is active
      let finalBannerImage = bannerImage;
      if (showCropper && bannerImage) {
        finalBannerImage = await createCroppedImage();
      }
      
      // Upload banner image if changed
      let bannerUrl = eventData.bannerUrl;
      if (finalBannerImage) {
        bannerUrl = await uploadBannerToCloudinary(finalBannerImage) || '';
      }
      
      // Update the event
      await updateEvent(eventId, {
        name: eventData.name.trim(),
        date: eventData.date,
        welcomeMessage: eventData.welcomeMessage.trim(),
        description: eventData.description?.trim(),
        bannerUrl: bannerUrl,
      });
      
      toast.success('Event updated successfully!', { id: 'update-event' });
      setSuccess('Event updated successfully!');
      // Navigate back to event details after a brief delay
      setTimeout(() => {
        router.push(`/events/${eventId}`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event', { id: 'update-event' });
      setError('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-rose-100 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
          </div>
          <p className="text-gray-500">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error === 'Event not found') {
    return (
      <div className="container mx-auto px-4 py-16">
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
            We couldn't find an event with the ID: {eventId}
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
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link 
          href={`/events/${eventId}`} 
          className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Event Details
        </Link>

        {error && error !== 'Event not found' && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
          />
        )}
        
        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
          />
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 p-8 mb-12">
          <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-8 text-rose-600">Edit Event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner Image Upload */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Banner Image
              </label>
              {showCropper && bannerPreview ? (
                <div className="space-y-4">
                  <div className="relative h-80 w-full border rounded-lg overflow-hidden">
                    <Cropper
                      image={bannerPreview}
                      crop={crop}
                      zoom={zoom}
                      aspect={3}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm text-gray-600">
                      Zoom: {zoom.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={createCroppedImage}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Apply Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${bannerPreview ? 'border-transparent' : 'border-gray-300 hover:border-rose-500'}`}
                  onClick={handleBannerUpload}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    name="bannerImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                  />
                  
                  {bannerPreview ? (
                    <>
                      <div className="absolute inset-0">
                        <Image 
                          src={bannerPreview} 
                          alt="Banner preview" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCropper(true);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                          Adjust Image
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBanner();
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-md"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click to upload a banner image</p>
                      <p className="text-xs text-gray-500">Recommended size: 1200 x 400 px</p>
                    </>
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This banner will appear at the top of your event page. If no banner is uploaded, a default gradient will be used.
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Event Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={eventData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                placeholder="Enter event name"
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                Event Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="welcomeMessage" className="block text-gray-700 font-medium mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={eventData.welcomeMessage}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                placeholder="Enter a welcome message for your guests"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                placeholder="Enter a description for your event"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Link 
                href={`/events/${eventId}`}
                className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting || uploadingBanner || showCropper}
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 