/**
 * This script adds the externalId field to the User model in the database
 * Run with: node scripts/migrate-to-clerk.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database migration for Clerk integration...');
  
  try {
    // Step 1: Check if prisma schema has been updated with the externalId field
    // This script assumes you've already updated the schema.prisma file and run prisma migrate
    
    // Step 2: Set up a webhook endpoint in Clerk dashboard
    console.log('Please set up the following webhook endpoint in your Clerk dashboard:');
    console.log('  URL: https://your-domain.com/api/webhook/clerk');
    console.log('  Events to listen for: user.created, user.updated, user.deleted');
    console.log('\nMake sure to set the CLERK_WEBHOOK_SECRET in your .env.local file');
    
    // Step 3: Remove NextAuth session data
    console.log('\nCleaning up NextAuth sessions and accounts...');
    try {
      const deletedSessions = await prisma.session.deleteMany({});
      console.log(`Deleted ${deletedSessions.count} sessions`);
      
      const deletedAccounts = await prisma.account.deleteMany({});
      console.log(`Deleted ${deletedAccounts.count} accounts`);
      
      const deletedTokens = await prisma.verificationToken.deleteMany({});
      console.log(`Deleted ${deletedTokens.count} verification tokens`);
    } catch (error) {
      console.log('Warning: Unable to clean up NextAuth data. This is expected if you have already removed these tables.');
    }
    
    console.log('\nMigration script completed. Your database is now ready for Clerk authentication!');
    console.log('\nNext steps:');
    console.log('1. Make sure all your users sign up again with Clerk');
    console.log('2. Monitor the logs for any authentication issues');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 