'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { addEvent } from '../../lib/events';
import Alert from '../../components/Alert';
import { getCurrentUserId } from '../../lib/user';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State to store the database user ID
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  
  // Load the database user ID when the component mounts
  useEffect(() => {
    const fetchDbUserId = async () => {
      try {
        if (isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
          // Make a request to get the database user ID
          const response = await fetch(`/api/user/get-id?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
          if (response.ok) {
            const data = await response.json();
            setDbUserId(data.userId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch database user ID:', error);
      }
    };
    
    fetchDbUserId();
  }, [isSignedIn, user]);
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pin, setPin] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    date?: string;
    description?: string;
    pin?: string;
    banner?: string;
  }>({});
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  // Track whether an event was just created
  const [eventCreated, setEventCreated] = useState(false);
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in?redirect_url=/events/create');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setIsPrivate(checked);
      
      // Clear PIN if event is set to public
      if (name === 'isPrivate' && !checked) {
        setPin('');
      }
    } else if (type === 'file') {
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
      if (name === 'name') {
        setEventName(value);
      } else if (name === 'date') {
        setEventDate(value);
      } else if (name === 'description') {
        setDescription(value);
      } else if (name === 'pin') {
        setPin(value);
      } else if (name === 'welcomeMessage') {
        setWelcomeMessage(value);
      }
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
      // Fix the constructor signature issue by using document.createElement instead
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

  const generateRandomPin = () => {
    // Generate random 4-digit PIN
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(randomPin);
  };

  const validateForm = () => {
    const newErrors: {name?: string; date?: string; description?: string; pin?: string; banner?: string} = {};
    
    if (!eventName.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!eventDate) {
      newErrors.date = 'Event date is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (isPrivate && (!pin || pin.length !== 4)) {
      newErrors.pin = 'Private events require a 4-digit PIN';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload banner image to Cloudinary
  const uploadBannerToCloudinary = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploadingBanner(true);
    
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
      toast.success('Banner image uploaded successfully!');
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner image. Check your Cloudinary configuration.');
      setErrors(prev => ({ ...prev, banner: 'Failed to upload banner image' }));
      return null;
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      toast.loading('Creating your event...', { id: 'creating-event' });
      
      try {
        // Process the cropped image if cropper is active
        let finalBannerImage = bannerImage;
        if (showCropper && bannerImage) {
          finalBannerImage = await createCroppedImage();
        }
        
        // Upload banner image if selected
        let bannerUrl = null;
        if (finalBannerImage) {
          bannerUrl = await uploadBannerToCloudinary(finalBannerImage);
        }
        
        // Create the event with the user ID from the database and banner URL
        const newEvent = await addEvent({
          name: eventName.trim(),
          date: eventDate,
          welcomeMessage: welcomeMessage.trim(),
          description: description.trim(),
          private: isPrivate,
          pin: isPrivate ? pin : null,
          userId: dbUserId, // Associate the event with the database user ID
          bannerUrl: bannerUrl, // Add the banner URL
        });
        
        // Reset the form
        setEventName('');
        setEventDate('');
        setWelcomeMessage('');
        setDescription('');
        setIsPrivate(false);
        setPin('');
        setBannerImage(null);
        setBannerPreview(null);
        setShowCropper(false);
        
        // Show success message with toast
        toast.success('Event created successfully!', { id: 'creating-event' });
        setSuccessMessage('Event created successfully!');
        setEventCreated(true);
        
        // Clear success message after 5 seconds, but keep the "View All Events" button
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        
        // Success - redirect to the event page
        router.push(`/events/${newEvent.id}`);
      } catch (error) {
        console.error('Failed to create event:', error);
        toast.error('Failed to create event. Please try again.', { id: 'creating-event' });
        setSuccessMessage('Failed to create event. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/events" 
          className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-rose-100 p-8 mb-12">
          <div className="mb-8">
            <h1 className="text-3xl font-sans font-bold mb-3 text-rose-600">Create New Event</h1>
            <p className="text-gray-600 font-sans">
              Fill out the form below to create a new event for your guests.
            </p>
          </div>
          
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              autoClose={true}
              duration={5000}
            />
          )}
          
          {eventCreated ? (
            <div className="text-center py-10">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-sans font-bold mb-4 text-gray-800">Event Created!</h2>
              <p className="text-gray-600 mb-8 font-sans">
                Your event has been created successfully. You can now view it in your events list.
              </p>
              <Link 
                href="/events" 
                className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
              >
                View All Events
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 font-sans">
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
                {errors.banner && (
                  <p className="text-red-500 text-sm mt-1">{errors.banner}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This banner will appear at the top of your event page. If no banner is uploaded, a default gradient will be used.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name*
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="name"
                  value={eventName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Wedding, Birthday Party, etc."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date*
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="date"
                  value={eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={welcomeMessage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                  placeholder="Welcome message for your guests..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={6}
                  placeholder="Tell your guests about this event..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-4">
                  <input
                    id="isPrivate"
                    name="isPrivate"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                    Make this event private (requires PIN access)
                  </label>
                </div>
                
                {isPrivate && (
                  <div className="ml-7">
                    <div className="flex items-end space-x-2">
                      <div className="flex-grow">
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                          Event PIN (4 digits)
                        </label>
                        <input
                          id="pin"
                          name="pin"
                          type="text"
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={pin}
                          onChange={handleChange}
                          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="4-digit PIN"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={generateRandomPin}
                        className="px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Generate PIN
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Share this PIN with your guests to allow them access to the event
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Link href="/events" className="text-gray-600 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md disabled:bg-rose-400"
                  disabled={isSubmitting || uploadingBanner || showCropper}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 