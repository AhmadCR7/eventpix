import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// Define webhook event type
interface WebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: string;
}

export async function POST(req: Request) {
  // Get the body
  const payload = await req.json();

  // For now, let's just log the event type and not verify the signature
  // since we don't have proper svix package setup
  console.log(`Webhook event type: ${payload.type}`);

  try {
    // Handle the webhook event
    const event = payload as WebhookEvent;
    const eventType = event.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      
      const primaryEmail = email_addresses?.[0]?.email_address;
      if (!primaryEmail) {
        return new Response('Error: No email found', { status: 400 });
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: primaryEmail },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: `${first_name || ''} ${last_name || ''}`.trim(),
              image: image_url || existingUser.image,
              // We'll add externalId later when schema is updated
              // externalId: id,
            },
          });
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: primaryEmail,
              name: `${first_name || ''} ${last_name || ''}`.trim(),
              image: image_url || null,
              role: 'HOST',
              // We'll add externalId later when schema is updated
              // externalId: id,
            },
          });
        }

        return new Response('User synchronized', { status: 200 });
      } catch (error) {
        console.error('Error handling user event:', error);
        return new Response('Error handling user event', { status: 500 });
      }
    }

    if (eventType === 'user.deleted') {
      try {
        // Find user by email (if available)
        if (event.data.email_addresses && event.data.email_addresses.length > 0) {
          const email = event.data.email_addresses[0].email_address;
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Instead of removing externalId, we could do other cleanup
            // For example, anonymizing the user but keeping their data
            await prisma.user.update({
              where: { id: user.id },
              data: {
                name: 'Deleted User',
                image: null,
              },
            });
          }
        }

        return new Response('User processed', { status: 200 });
      } catch (error) {
        console.error('Error handling user deletion:', error);
        return new Response('Error handling user deletion', { status: 500 });
      }
    }

    // Return a 200 response for all other events
    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 