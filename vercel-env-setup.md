# Vercel Environment Setup Instructions

Follow these steps to properly set up your Vercel environment variables for production deployment:

## Required Environment Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-vercel-app-name.vercel.app` | **CRITICAL**: Must match your Vercel URL exactly |
| `NEXTAUTH_SECRET` | `5d88a92d48b72e3b5ee2c15ec8b5ad7e` | Same as your local secret |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_7MKgonyq1ReQ@ep-hidden-union-a5uwgbcc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` | Database connection string without quotes |
| `CLOUDINARY_CLOUD_NAME` | `dov2iujbo` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `867292617218286` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `gGk80RJ-RBUNXRwRFy3dJRjjtUE` | Cloudinary API secret |
| `CLOUDINARY_URL` | `cloudinary://867292617218286:gGk80RJ-RBUNXRwRFy3dJRjjtUE@dov2iujbo` | Cloudinary URL |

## Steps to Add Environment Variables

1. Go to your Vercel dashboard and select your project
2. Click on "Settings" tab
3. Select "Environment Variables" from the left sidebar
4. Add each variable individually using the form:
   - Enter the name (e.g., `NEXTAUTH_URL`)
   - Enter the value (e.g., `https://your-vercel-app-name.vercel.app`)
   - Select environments (Production, Preview, Development)
   - Click "Add"
5. **IMPORTANT**: After adding all variables, redeploy your application

## Redeployment

After setting environment variables:

1. Go to the "Deployments" tab
2. Find your latest deployment
3. Click on the three dots menu (⋮)
4. Select "Redeploy"
5. Confirm the redeployment

## Troubleshooting

If you still experience issues after setting these variables:

1. Check your deployment logs for any errors
2. Verify that your `NEXTAUTH_URL` exactly matches your Vercel URL
3. Ensure your database URL is correctly formatted and accessible from Vercel

Remember that environment variables are case-sensitive! 