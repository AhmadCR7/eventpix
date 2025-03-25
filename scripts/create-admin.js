/**
 * This script creates an admin user in the database
 * Run with: node scripts/create-admin.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Default admin credentials
const DEFAULT_ADMIN = {
  name: 'Admin User',
  email: 'admin@guestpix.com',
  password: 'Admin@123456',
  role: 'ADMIN'
};

// Create a new Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');
  
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN.email },
      select: { id: true }
    });
    
    if (existingUser) {
      console.log(`Admin user already exists with email: ${DEFAULT_ADMIN.email}`);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    
    // Create admin user
    const user = await prisma.user.create({
      data: {
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        role: DEFAULT_ADMIN.role
      }
    });
    
    console.log(`Admin user created successfully!`);
    console.log(`Email: ${DEFAULT_ADMIN.email}`);
    console.log(`Password: ${DEFAULT_ADMIN.password}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 