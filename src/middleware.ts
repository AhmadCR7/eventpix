import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function - now Edge compatible
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  
  // Skip middleware for api routes, static files and resources
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public routes don't need auth checks
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/') || 
    pathname === '/how-it-works' ||
    pathname.startsWith('/events/verify') || 
    pathname.startsWith('/guest/')
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/events');
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Simple cookie check for auth
  const hasSessionToken = 
    request.cookies.get('next-auth.session-token') || 
    request.cookies.get('__Secure-next-auth.session-token');
  
  // If no auth and trying to access protected route, redirect to login
  if (!hasSessionToken) {
    // Create the signin URL without using the URL constructor
    const redirectUrl = new URL('/auth/signin', url.origin);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 