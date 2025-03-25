# GuestPix

## Digital Photo Gallery and Guestbook for Events

GuestPix is a modern web application that allows event hosts to create digital photo galleries and guestbooks for their events. Guests can upload photos and leave messages without needing to create an account or install an app.

![GuestPix Logo](public/logo.png)

## Features

- 🔐 **User Authentication** - Secure login/signup for event hosts
- 👑 **Admin Dashboard** - Special access for administrators to manage all events
- 📱 **No App Required** - Guests upload photos via QR code or link
- 📸 **Photo Gallery** - Beautiful display of event photos
- ✏️ **Digital Guestbook** - Leave messages for the event host
- 🔒 **Private Events** - Secure events with a PIN
- 🖼️ **Event Management** - Create, edit, and delete events
- 🌐 **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: NextAuth.js, Prisma, SQLite
- **Storage**: Cloudinary
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/guestpix-app.git
   cd guestpix-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
   # Cloudinary (for image storage)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Create admin user:
   ```bash
   node scripts/create-admin.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Access the application at http://localhost:3000

## Admin Access

Default admin credentials:
- Email: admin@guestpix.com
- Password: Admin@123456

## Deployment

The app is optimized for deployment on Vercel:

1. Fork this repository
2. Connect to Vercel
3. Set up environment variables
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Version History

- 1.0.0 - Initial release with core functionality
