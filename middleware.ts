import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware function - removed runtime specification for better Edge compatibility
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  
  // Enhanced debugging in production
  console.log(`Middleware: Processing ${pathname}`);
  
  // Only handle auth redirects for events, dashboard, profile
  if (
    (pathname.startsWith('/events') || 
     pathname.startsWith('/dashboard') || 
     pathname.startsWith('/profile')) &&
    !pathname.startsWith('/events/verify')
  ) {
    // Check all possible session tokens for production/dev environments
    const isAuthenticated = checkAuthentication(request);
    
    if (!isAuthenticated) {
      console.log(`Middleware: Unauthenticated access to ${pathname}, redirecting to signin`);
      
      // Create redirect URL with absolute origin to avoid URL construction issues
      const origin = request.nextUrl.origin;
      const redirectUrl = new URL(`/auth/signin`, origin);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`Middleware: Authenticated access to ${pathname}, proceeding`);
    }
  }
  
  // Default: allow the request to proceed
  return NextResponse.next();
}

// Helper function to check authentication with multiple possible cookie names
function checkAuthentication(request: NextRequest): boolean {
  // Check for both secure and non-secure cookie names
  const hasSessionToken = request.cookies.has('next-auth.session-token');
  const hasSecureSessionToken = request.cookies.has('__Secure-next-auth.session-token');
  
  // Log the cookies for debugging
  console.log('Authentication check:', {
    hasSessionToken,
    hasSecureSessionToken,
    cookieCount: request.cookies.size
  });
  
  return hasSessionToken || hasSecureSessionToken;
}

// Use a simplified matcher that's more compatible with Edge
export const config = {
  matcher: [
    // Include paths that should be protected
    '/dashboard/:path*',
    '/profile/:path*',
    '/events/:path*', 
  ],
}; 