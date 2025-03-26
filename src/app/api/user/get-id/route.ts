import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the email from the query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Validate input
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user ID
    return NextResponse.json({ userId: user.id });
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user ID' },
      { status: 500 }
    );
  }
} 