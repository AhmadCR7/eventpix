import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/sign-in*',
  '/sign-up*',
  '/how-it-works',
  '/api/webhook*',
  '/api/events/public*',
  '/events/public*',
];

const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    if (publicPath.endsWith('*')) {
      const prefix = publicPath.slice(0, -1);
      return path.startsWith(prefix);
    }
    return path === publicPath;
  });
};

// Use Clerk's middleware with a custom handler
export default clerkMiddleware((auth, req) => {
  const path = req.nextUrl.pathname;
  
  // Allow public paths to proceed without authentication
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // For non-public paths, check if the user is authenticated
  return auth().then(auth => {
    if (!auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  });
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 