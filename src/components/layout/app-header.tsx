'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { isThisMonth } from 'date-fns';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { LogOut, User as UserIcon, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppHeader() {
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

  const aiLimit = 20;
  let aiUsage = 0;
  if (userProfile) {
      const lastReset = userProfile.aiUsageLastReset?.toDate() ?? new Date(0);
      if (isThisMonth(lastReset)) {
          aiUsage = userProfile.aiUsageCount ?? 0;
      }
  }
  const usagePercentage = (aiUsage / aiLimit) * 100;


  return (
    <header 
      className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-4 bg-slate-950/80 px-4 backdrop-blur-lg md:px-6"
    >
      <div>
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1">
        {/* Search can be implemented later */}
      </div>
      <div className="ml-auto flex items-center gap-4">

        {isUserLoading || isProfileLoading ? (
            <Skeleton className="h-8 w-40 rounded-lg bg-slate-800" />
        ) : userProfile && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="hidden w-40 items-center gap-3 sm:flex">
                           <Wand2 className="h-5 w-5 text-blue-400" />
                            <div className="w-full">
                               <Progress value={usagePercentage} className="h-2" />
                            </div>
                            <span className="text-xs font-medium text-slate-400">{aiUsage}/{aiLimit}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <p>Seu uso do Assistente de IA este mês.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}

        {isUserLoading ? <Skeleton className="h-10 w-10 rounded-full bg-slate-800" /> : user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-slate-700 group-hover:border-blue-500 transition-colors">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Avatar'} />}
                            <AvatarFallback className="bg-slate-800 text-slate-300">
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user.displayName}</p>
                        <p className="text-xs leading-none text-slate-400">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="text-slate-300 focus:bg-slate-800 focus:text-white">
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
