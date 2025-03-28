import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserId } from '../../../lib/user';

export async function GET() {
  try {
    // Get clerk user information
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the database user ID using the utility function
    const dbUserId = await getCurrentUserId();
    
    if (!dbUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user ID
    return NextResponse.json({ userId: dbUserId });
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user ID' },
      { status: 500 }
    );
  }
} 