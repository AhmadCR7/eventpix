import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

// Extremely simplified middleware
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
    // Check for session token
    const hasSession = request.cookies.has('next-auth.session-token') || 
                       request.cookies.has('__Secure-next-auth.session-token');
    
    if (!hasSession) {
      // Create redirect URL
      const redirectUrl = new URL('/auth/signin', url.origin);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Default: allow the request to proceed
  return NextResponse.next();
}

// Use a simplified matcher
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/events/:path*', 
    // Exclude paths that don't need auth
    '/((?!api|_next/static|_next/image|auth|favicon.ico|guest).*)',
  ],
}; 