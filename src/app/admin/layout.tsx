'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_UID = 'nccUQWtsTsRmnFXPn3HnMZ4R9ch1';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!user || user.uid !== ADMIN_UID)) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || user.uid !== ADMIN_UID) {
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
