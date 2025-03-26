import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * Get the current user from Clerk and sync with our database
 */
export async function getCurrentUser() {
  try {
    // Get the user from Clerk
    const user = await currentUser();
    
    if (!user) {
      console.log('No Clerk user found');
      return null;
    }
    
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.log('No email found for user');
      return null;
    }
    
    console.log('Checking for user with email:', email);
    
    // Check if the user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });
    
    // If the user doesn't exist, create them
    if (!dbUser) {
      console.log('Creating new user with email:', email);
      
      dbUser = await prisma.user.create({
        data: {
          email: email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          // Set default role to HOST
          role: "HOST",
          // Set image if available
          image: user.imageUrl || null,
          // We'll handle externalId once the schema is properly synced
        },
      });
      
      console.log('User created with ID:', dbUser.id);
    } else {
      // Update the user's information if they exist
      console.log('Updating existing user with ID:', dbUser.id);
      
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || dbUser.name,
          image: user.imageUrl || dbUser.image,
          // We'll handle externalId once the schema is properly synced
        },
      });
    }
    
    return dbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
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
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Debug function to log user information
 */
export async function debugUserInfo() {
  try {
    // Get user from Clerk
    const user = await currentUser();
    
    if (!user) {
      console.log('No Clerk user found');
      return null;
    }
    
    console.log('Clerk User:', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress
    });
    
    // Get user from our database
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.log('No email found for user');
      return null;
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!dbUser) {
      console.log('No database user found with email:', email);
      return null;
    }
    
    console.log('Database User:', {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    });
    
    return {
      clerkUser: user,
      dbUser
    };
  } catch (error) {
    console.error('Error getting debug user info:', error);
    return null;
  }
} 