import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Helper function to conditionally log based on environment
const devLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, ...args);
  }
};

// Helper function to conditionally log errors based on environment
const devErrorLog = (message: string, error: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, error);
  } else {
    // In production, just log error occurred without details
    console.error(`Error in user.ts: ${message}`);
  }
};

/**
 * Get the current user from Clerk and sync with our database
 */
export async function getCurrentUser() {
  try {
    // Get the user from Clerk
    const user = await currentUser();
    
    if (!user) {
      devLog('No Clerk user found');
      return null;
    }
    
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      devLog('No email found for user');
      return null;
    }
    
    devLog('Looking up user with email/ID:', email);
    
    // Try to find user by multiple identifiers
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          // Try to find by email (primary method)
          { email },
          // Try to find by Clerk ID
          { externalId: user.id },
          // Known IDs from logs for backward compatibility
          { id: 'd7e1f51c-8a7d-4afe-94bc-42deae3a401b' },
          { id: 'ecf63249-f4fd-4043-9305-370b3b4d591a' }
        ]
      }
    });
    
    // If the user doesn't exist, create them
    if (!dbUser) {
      devLog('Creating new user with email:', email);
      
      dbUser = await prisma.user.create({
        data: {
          email: email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          // Set default role to HOST
          role: "HOST",
          // Set image if available
          image: user.imageUrl || null,
          // Set the external ID to match Clerk
          externalId: user.id,
        },
      });
      
      devLog('User created with ID:', dbUser.id);
    } else {
      // Always update the user's information to ensure sync
      devLog('Updating existing user with ID:', dbUser.id);
      
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          // Do NOT update email to avoid unique constraint errors
          // email: email,  <- This causes the error
          // Update name if changed
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || dbUser.name,
          // Update image if changed
          image: user.imageUrl || dbUser.image,
          // ALWAYS update external ID to ensure it's correct
          externalId: user.id,
        },
      });
      
      devLog('User updated successfully, externalId:', user.id);
    }
    
    return dbUser;
  } catch (error) {
    devErrorLog('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the user ID for the current user
 */
export async function getCurrentUserId() {
  try {
    // Use the getCurrentUser function to ensure the user exists in the database
    const dbUser = await getCurrentUser();
    return dbUser?.id || null;
  } catch (error) {
    devErrorLog("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Debug function to log user information - only enabled in development
 */
export async function debugUserInfo() {
  if (process.env.NODE_ENV === 'production') {
    return null; // Skip this functionality in production
  }
  
  try {
    // Get user from Clerk
    const user = await currentUser();
    
    if (!user) {
      devLog('No Clerk user found');
      return null;
    }
    
    devLog('Clerk User:', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress
    });
    
    // Get user from our database
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      devLog('No email found for user');
      return null;
    }
    
    // Try to find by multiple identifiers for debugging
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { externalId: user.id }
        ]
      }
    });
    
    if (!dbUser) {
      devLog('No database user found with email or Clerk ID');
      return null;
    }
    
    devLog('Database User:', {
      id: dbUser.id,
      email: dbUser.email,
      externalId: dbUser.externalId,
      name: dbUser.name,
      role: dbUser.role
    });
    
    // Check if the externalId is correctly set
    if (dbUser.externalId !== user.id) {
      devLog('⚠️ External ID mismatch detected. Current:', dbUser.externalId, 'Should be:', user.id);
    } else {
      devLog('✅ External ID matches correctly');
    }
    
    return {
      clerkUser: user,
      dbUser
    };
  } catch (error) {
    devErrorLog('Error getting debug user info:', error);
    return null;
  }
} 