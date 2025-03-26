'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useState, useEffect } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Using this pattern to ensure hydration works correctly in Next.js
  if (!isMounted) {
    return null;
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
} 