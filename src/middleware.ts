import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function - now Edge compatible
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for api routes, static files and resources
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the path is a protected route
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/events');
  
  // Public routes and guest routes don't need middleware processing
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/') || 
    pathname === '/how-it-works' ||
    pathname.startsWith('/events/verify') || 
    pathname.startsWith('/guest/')
  ) {
    return NextResponse.next();
  }
  
  // Simple cookie check - avoid using async/await
  const hasSessionToken = 
    request.cookies.get('next-auth.session-token') || 
    request.cookies.get('__Secure-next-auth.session-token');
  
  // Redirect if accessing protected route without auth
  if (isProtectedRoute && !hasSessionToken) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 