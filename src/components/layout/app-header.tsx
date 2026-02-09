'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';


export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/inventory/new')) return 'Adicionar Novo Item';
    if (pathname.includes('/edit')) return 'Editar Item';
    if (pathname.startsWith('/inventory/')) return 'Detalhes do Item';
    return 'BriqueBoost';
  };

  const aiUsage = userProfile?.aiUsageCount ?? 0;
  const aiLimit = 20;
  const aiUsagePercent = (aiUsage / aiLimit) * 100;

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
          <Skeleton className="h-8 w-48" />
        ) : userProfile ? (
          <div className="hidden w-48 flex-col gap-1 md:flex">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className='flex items-center gap-1'>
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span>Uso de IA</span>
                </div>
                <span className={`font-bold ${aiUsage >= aiLimit ? 'text-destructive' : 'text-foreground'}`}>
                {aiUsage}/{aiLimit}
                </span>
            </div>
            <Progress value={aiUsagePercent} className="h-2" />
          </div>
        ) : null}

        {isUserLoading ? <Skeleton className="h-9 w-9 rounded-full" /> : user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Avatar'} />}
                            <AvatarFallback>
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
