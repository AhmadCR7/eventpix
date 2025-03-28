# Cloudinary Integration Guide for GuestPix

This guide walks you through setting up and testing Cloudinary integration with your GuestPix application.

## Prerequisites

- Cloudinary account (free tier is sufficient)
- GuestPix application running locally

## Configuration Steps

### 1. Create a Cloudinary Upload Preset

1. Log in to your Cloudinary dashboard at [https://cloudinary.com/console](https://cloudinary.com/console)
2. Navigate to **Settings** > **Upload** > **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Name**: `eventpix_uploads` (or whatever you've set in your `.env.local` file)
   - **Signing Mode**: Set to **Unsigned**
   - **Folder**: `event_banners` (optional, but recommended for organization)
   - **Access Mode**: Set to **Public**
5. Save the preset

### 2. Update Environment Variables

Ensure your `.env.local` file contains the following variables:

```
# Cloudinary configuration with individual parameters
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary upload preset - must be an unsigned upload preset
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=eventpix_uploads

# Combined Cloudinary URL (primary method)
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your Cloudinary credentials.

### 3. Restart Your Application

After updating the environment variables, restart your application:

```bash
npm run dev
```

## Testing Cloudinary Integration

We've created a debug page to help you test and troubleshoot Cloudinary integration.

### Using the Debug Page

1. Navigate to [http://localhost:3000/debug/cloudinary](http://localhost:3000/debug/cloudinary) in your browser
2. The page will display:
   - Sample Cloudinary images to verify the connection
   - A form to test custom Cloudinary URLs
   - Both Next.js Image component and regular img tag rendering

### Testing Image Uploads

1. Go to [http://localhost:3000/events/create](http://localhost:3000/events/create)
2. Create a new event and upload a banner image
3. Check the browser console for any error messages
4. If successful, you should see your image in the Cloudinary dashboard under the `event_banners` folder

## Troubleshooting Common Issues

### "Upload preset not found" Error

If you receive a 400 Bad Request with "Upload preset not found":

1. Verify your upload preset name in both Cloudinary dashboard and your `.env.local` file
2. Ensure the upload preset is set to **Unsigned**
3. Check your browser console for the full error message

### Images Appear Black or Don't Load

1. Visit the debug page at [http://localhost:3000/debug/cloudinary](http://localhost:3000/debug/cloudinary)
2. Test your image URL to check if it's accessible
3. Verify that your Cloudinary account hasn't exceeded the free tier limits
4. Check that the image format is supported by the browser

### CORS Issues

If you encounter CORS errors:

1. In your Cloudinary dashboard, go to **Settings** > **Security**
2. Add your application's domain to the list of allowed origins
3. For local development, add `http://localhost:3000`

## Advanced Configuration

For additional customization options:

1. Modify the upload options in `src/app/events/create/page.tsx` and `src/app/events/[id]/edit/page.tsx`
2. Add transformation parameters to your Cloudinary URLs for automatic resizing/cropping
3. Consider enabling eager transformations in your upload preset to optimize images on upload

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Component Documentation](https://nextjs.org/docs/api-reference/next/image)
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration) 