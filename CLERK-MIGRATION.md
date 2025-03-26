# NextAuth to Clerk Migration Guide

This guide provides instructions for completing the migration from NextAuth.js to Clerk for authentication in the GuestPix application.

## What has been done

1. ✅ Installed Clerk packages (`@clerk/nextjs`)
2. ✅ Added Clerk environment variables to `.env.local`
3. ✅ Updated the application layout to use Clerk provider
4. ✅ Created sign-in and sign-up pages for Clerk
5. ✅ Created middleware for route protection
6. ✅ Updated core components to use Clerk hooks instead of NextAuth
7. ✅ Created a webhook handler for user synchronization

## What needs to be completed

1. 🔄 **Database Migration**: Run a proper Prisma migration to add the `externalId` field to the User model
2. 🔄 **Testing**: Test the authentication flow end-to-end
3. 🔄 **User Data Migration**: Migrate existing users' data if needed

## Database Migration Instructions

### 1. Update the Prisma Schema

The schema has already been updated with the `externalId` field in the User model. You'll need to run the migration:

```bash
# Generate the migration files
npx prisma migrate dev --name add-clerk-external-id

# Apply the migration
npx prisma db push
```

### 2. Configure Clerk Webhook

1. Go to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to "Webhooks" in the sidebar
3. Create a new webhook endpoint with the following settings:
   - URL: `https://your-domain.com/api/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the "Signing Secret" and add it to your `.env.local` file:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_signing_secret
   ```

### 3. Run the Migration Script

```bash
node scripts/migrate-to-clerk.js
```

This script will:
- Clean up NextAuth-related data in the database
- Provide additional configuration instructions

## Testing the Migration

1. Sign out of any existing sessions
2. Clear your browser's cookies and local storage
3. Navigate to the home page
4. Test sign-up, sign-in, and protected routes

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure all environment variables are correctly set
2. **Missing User Data**: Check if the webhook is properly configured
3. **Protected Route Issues**: Verify the middleware configuration

### How to Roll Back

If necessary, you can roll back to NextAuth by:

1. Restoring the original code from version control
2. Restoring the original Prisma schema without the `externalId` field
3. Removing Clerk environment variables

## Additional Notes

- Clerk UI components can be customized using the Clerk Dashboard
- User management is now handled through the Clerk Dashboard
- OAuth providers can be configured directly in the Clerk Dashboard 