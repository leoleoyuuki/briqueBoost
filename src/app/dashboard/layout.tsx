'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivationForm } from '@/components/dashboard/activation-form';
import type { UserProfile } from '@/lib/types';
import { WelcomeModal } from '@/components/dashboard/welcome-modal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // State for the welcome modal
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  // Effect to check if welcome modal should be shown
  useEffect(() => {
    // Only run on the client-side after hydration
    const hasSeenModal = localStorage.getItem('briqueboost_welcome_modal_seen');
    if (!hasSeenModal) {
      setWelcomeModalOpen(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setWelcomeModalOpen(false);
    localStorage.setItem('briqueboost_welcome_modal_seen', 'true');
  };

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

  const isExpired = userProfile?.expiresAt && userProfile.expiresAt.toDate() < new Date();
  
  if (userProfile?.accountStatus === 'pending' || isExpired) {
    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center">
            <ActivationForm isExpired={isExpired} />
        </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppSidebar />
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
        {/* Render the modal */}
        <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleCloseWelcomeModal} />
      </div>
    </SidebarProvider>
  );
}
