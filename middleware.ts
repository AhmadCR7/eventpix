import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware function - removed runtime specification for better Edge compatibility
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  
  // Only handle auth redirects for events, dashboard, profile
  if (
    (pathname.startsWith('/events') || 
     pathname.startsWith('/dashboard') || 
     pathname.startsWith('/profile')) &&
    !pathname.startsWith('/events/verify')
  ) {
    // Check for session token - support both secure and non-secure cookies
    const hasSession = request.cookies.has('next-auth.session-token') || 
                       request.cookies.has('__Secure-next-auth.session-token');
    
    if (!hasSession) {
      // Create redirect URL
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Default: allow the request to proceed
  return NextResponse.next();
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