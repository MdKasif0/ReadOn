'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is not loading and a user exists, redirect them.
    if (!loading && user) {
      router.replace('/feed');
    }
  }, [user, loading, router]);

  // While loading auth state, or if a user is found (and redirect is pending), show a spinner.
  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If not loading and no user, show the auth form (login/signup).
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background p-4 pt-20 sm:justify-center sm:pt-4">
       <div className="absolute top-4 left-4">
        <Link href="/" aria-label="Back to home">
          <Logo />
        </Link>
      </div>
      {children}
    </main>
  );
}
