// Seed script to populate the database with initial events
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');

  // Clear existing events
  await prisma.photo.deleteMany({});
  await prisma.event.deleteMany({});
  
  // Create sample events
  const sampleEvents = [
    {
      name: 'Summer Wedding',
      date: new Date('2023-07-15'),
      welcomeMessage: 'Welcome to our special day! We\'re so happy you could join us to celebrate our wedding. Please share your photos here for everyone to enjoy!'
    },
    {
      name: 'Company Holiday Party',
      date: new Date('2023-12-20'),
      welcomeMessage: 'Happy Holidays! Share your festive moments from our annual company celebration!'
    },
    {
      name: 'Family Reunion',
      date: new Date('2023-08-05'),
      welcomeMessage: 'Welcome to the Johnson Family Reunion! It\'s great to have everyone together again. Share your photos to help us create lasting memories.'
    }
  ];

  for (const eventData of sampleEvents) {
    const event = await prisma.event.create({
      data: eventData
    });
    console.log(`Created event: ${event.name} (ID: ${event.id})`);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 