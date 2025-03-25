# Deploying GuestPix

This guide provides instructions for deploying GuestPix to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. A complete build of the project (`npm run build`)
2. Environment variables set up (see `.env.example`)
3. Access to your preferred hosting platform

## Option 1: Deploying to Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications like GuestPix.

### Steps:

1. Create an account on [Vercel](https://vercel.com/)
2. Install the Vercel CLI: `npm i -g vercel`
3. From your project directory, run: `vercel`
4. Follow the CLI prompts to complete the deployment
5. Set up environment variables in the Vercel dashboard:
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Option 2: Deploying to a VPS or dedicated server

### Steps:

1. SSH into your server
2. Clone your repository: `git clone <your-repo-url>`
3. Navigate to the project directory: `cd guestpix-app`
4. Install dependencies: `npm install`
5. Create a `.env.local` file with your environment variables
6. Build the project: `npm run build`
7. Start the server: `npm run start`

For production use, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "guestpix" -- start
pm2 save
```

## Database Deployment

For production, consider migrating from SQLite to a more robust database like PostgreSQL:

1. Update your `DATABASE_URL` in `.env.local` to point to your PostgreSQL instance
2. Run Prisma migration: `npx prisma migrate deploy`

## Setting Up HTTPS

For production deployments, always use HTTPS:

1. Obtain an SSL certificate (Let's Encrypt is free)
2. Configure your web server (Nginx/Apache) to use your SSL certificate
3. Update `NEXTAUTH_URL` to use `https://`

## Monitoring and Logging

Consider setting up:

1. Application monitoring (e.g., Sentry)
2. Performance monitoring (e.g., New Relic)
3. Log aggregation (e.g., Logtail)

## Continuous Deployment

For continuous deployment:

1. Set up GitHub Actions or other CI/CD pipeline
2. Configure automatic testing
3. Deploy automatically on successful builds

## Troubleshooting

Common issues:

1. **Database Connection Errors**: Verify your DATABASE_URL and ensure your database is accessible from your deployment environment
2. **Authentication Issues**: Check that NEXTAUTH_URL and NEXTAUTH_SECRET are properly set
3. **Image Upload Problems**: Verify your Cloudinary credentials and check network connectivity

For more help, refer to the [GuestPix GitHub repository](https://github.com/username/guestpix-app) or open an issue. 