'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/inventory/new')) return 'Adicionar Novo Item';
    if (pathname.includes('/edit')) return 'Editar Item';
    if (pathname.startsWith('/inventory/')) return 'Detalhes do Item';
    return 'BriqueBoost';
  };

  const aiUsage = userProfile?.aiUsageCount ?? 0;
  const aiLimit = 20;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold font-headline md:text-xl">
        {getTitle()}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        {isProfileLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : userProfile ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Uso de IA:</span>
            <span className={`font-bold ${aiUsage >= aiLimit ? 'text-destructive' : 'text-foreground'}`}>
              {aiUsage}/{aiLimit}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
