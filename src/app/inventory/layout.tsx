'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivationForm } from '@/components/dashboard/activation-form';
import type { UserProfile } from '@/lib/types';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className='flex flex-col items-center gap-4'>
            <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-slate-800" />
                <Skeleton className="h-4 w-[200px] bg-slate-800" />
            </div>
        </div>
      </div>
    );
  }

  if (userProfile?.accountStatus === 'pending') {
    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center">
            <ActivationForm />
        </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppSidebar />
        <AppHeader />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
