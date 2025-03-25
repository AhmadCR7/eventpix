const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin email to preserve
const ADMIN_EMAIL = 'admin@guestpix.com';

async function cleanupUsers() {
  console.log('Starting user cleanup...');
  
  try {
    // Get the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true }
    });
    
    if (!adminUser) {
      console.error('Admin user not found. Please run create-admin.js first.');
      return;
    }
    
    console.log(`Found admin user with ID: ${adminUser.id}`);
    
    // Find all non-admin users
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        NOT: { email: ADMIN_EMAIL }
      }
    });
    
    console.log(`Found ${nonAdminUsers.length} non-admin users to delete.`);
    
    // Delete all users except admin
    const deleteResult = await prisma.user.deleteMany({
      where: {
        NOT: { email: ADMIN_EMAIL }
      }
    });
    
    console.log(`Successfully deleted ${deleteResult.count} users.`);
    
    // Get events that aren't associated with any user and associate them with admin
    const orphanedEvents = await prisma.event.findMany({
      where: {
        userId: null
      }
    });
    
    console.log(`Found ${orphanedEvents.length} events without an owner.`);
    
    // Update orphaned events to be owned by admin
    if (orphanedEvents.length > 0) {
      const updateResult = await prisma.event.updateMany({
        where: {
          userId: null
        },
        data: {
          userId: adminUser.id
        }
      });
      
      console.log(`Updated ${updateResult.count} events to be owned by admin.`);
    }
    
    console.log('User cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during user cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
cleanupUsers(); 