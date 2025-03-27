'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Using locally stored wedding photos
const memorialImages = [
  {
    id: 1,
    src: "/images/wedding/wedding1.jpg",
    alt: "Couple holding hands with wedding rings"
  },
  {
    id: 2,
    src: "/images/wedding/wedding2.jpg",
    alt: "Bride and groom at wedding ceremony"
  },
  {
    id: 3,
    src: "/images/wedding/wedding3.jpg",
    alt: "Wedding ceremony setup with chairs and flowers"
  },
  {
    id: 4,
    src: "/images/wedding/wedding4.jpg",
    alt: "Wedding rings on a wooden surface"
  },
  {
    id: 5,
    src: "/images/wedding/wedding5.jpg",
    alt: "Couple at wedding reception"
  },
  {
    id: 6,
    src: "/images/wedding/wedding6.jpg",
    alt: "Wedding rings and flowers"
  }
];

export default function MemorialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-advance functionality
  useEffect(() => {
    let slideInterval: NodeJS.Timeout;
    
    if (!isPaused) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev === memorialImages.length - 1 ? 0 : prev + 1));
      }, 4000); // Change slide every 4 seconds
    }
    
    // Clean up interval on component unmount or when paused
    return () => {
      clearInterval(slideInterval);
    };
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === memorialImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? memorialImages.length - 1 : prev - 1));
  };

  return (
    <section className="w-full bg-[#f8f5f0] py-12 border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Header text */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold mb-3 text-gray-800">
            Has the memorial date already passed?
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Simply send your private link to family and friends and start receiving photos and videos instantly.
          </p>
        </div>

        {/* Image slider */}
        <div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Previous button */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Images container */}
          <div className="flex overflow-hidden">
            <div className="flex justify-center w-full">
              {memorialImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`transition-opacity duration-500 ease-in-out w-full flex justify-center ${
                    index === currentSlide ? "opacity-100" : "opacity-0 absolute"
                  }`}
                >
                  <div className="relative w-full max-w-lg aspect-[4/3]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority={index === currentSlide}
                      quality={90}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide indicators */}
          <div className="flex justify-center mt-4">
            {memorialImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentSlide ? "bg-black" : "bg-gray-300"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 