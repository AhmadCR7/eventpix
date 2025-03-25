import { v2 as cloudinary } from 'cloudinary';

// Reset any existing configuration
cloudinary.config(true);

// Check if we have the CLOUDINARY_URL environment variable
if (process.env.CLOUDINARY_URL) {
  console.log('Configuring Cloudinary using CLOUDINARY_URL from environment');
  
  // Using the URL method ensures proper parsing of API key and secret
  cloudinary.config({
    url: process.env.CLOUDINARY_URL
  });
} else {
  // Fallback to individual credentials with explicit values (not from env variables)
  console.log('CLOUDINARY_URL not found, using individual credentials');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dov2iujbo",
    api_key: process.env.CLOUDINARY_API_KEY || "867292617218286",
    api_secret: process.env.CLOUDINARY_API_SECRET || "gGk80RJ-RBUNXRwRFy3dJRjjtUE"
  });
}

// Log configuration details for debugging
const config = cloudinary.config();
console.log('Cloudinary configuration loaded:');
console.log('- cloud_name:', config.cloud_name);
console.log('- api_key:', config.api_key);
console.log('- api_secret length:', config.api_secret ? config.api_secret.length : 0);

export default cloudinary; 