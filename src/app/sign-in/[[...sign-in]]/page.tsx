import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-center text-3xl font-bold mb-8 font-['Playfair_Display'] text-rose-600">
          Sign in to GuestPix
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SignIn />
        </div>
      </div>
    </div>
  );
} 