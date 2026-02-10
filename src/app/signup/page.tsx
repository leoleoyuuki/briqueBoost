'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";
import { Skeleton } from '@/components/ui/skeleton';


export default function SignupPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-8">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-16 w-16 text-blue-500" />
          <h1 className="mt-4 text-4xl font-bold font-headline text-slate-100">
            BriqueBoost
          </h1>
          <p className="mt-2 text-center text-slate-400">
            Crie sua conta e comece a lucrar hoje mesmo.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
