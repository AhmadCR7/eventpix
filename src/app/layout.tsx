import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import AuthNav from "./components/AuthNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuestPix - Photo Sharing for Events",
  description: "A modern photo-sharing platform for events and gatherings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" />
      </head>
      <ClerkProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-gray-800`}
          style={{
            backgroundColor: "#f9f7f5",
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
            backgroundAttachment: "fixed"
          }}
        >
          <AuthNav />
          <main>
            {children}
          </main>
          <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div>
                  <h3 className="text-xl font-['Playfair_Display'] font-semibold mb-4 text-rose-300">guestpix</h3>
                  <p className="text-gray-400 mb-6">
                    The easy way to collect and share photos from your special events. No apps required.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
                    <li><a href="/events" className="text-gray-400 hover:text-white">Events</a></li>
                    <li><a href="/how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                    <li><a href="/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Event Types</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">Weddings</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Corporate Events</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Birthdays</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Engagement Parties</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Contact & Support</h4>
                  <ul className="space-y-2">
                    <li><a href="/help" className="text-gray-400 hover:text-white">Help Center</a></li>
                    <li><a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a></li>
                    <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} GuestPix. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </body>
      </ClerkProvider>
    </html>
  );
}
