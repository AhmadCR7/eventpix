import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './app/api/auth/[...nextauth]/route';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  console.log(`Processing route: ${pathname}`);

  // Get the session
  const session = await auth();
  
  // Check if the path is a protected route that requires authentication
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/events');
  
  // Check if the path is a guest access route (events/verify or guest routes)
  const isGuestAccessRoute = 
    pathname.startsWith('/events/verify') || 
    pathname.startsWith('/guest/');
  
  // Public routes that don't require auth
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname === '/how-it-works' ||
    isGuestAccessRoute;
    
  // Handle auth requirements
  if (isProtectedRoute && !session) {
    // If no session, redirect to login for protected routes
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
  }
  
  // Continue for all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for API routes, static files, favicon, etc.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 