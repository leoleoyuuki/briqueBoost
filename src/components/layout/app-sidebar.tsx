'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  User,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const isActive = (href: string) => pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
            BriqueBoost
          </h2>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        <Link href="/inventory/new" passHref>
            <Button className="w-full mb-4" variant="default">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Novo Item</span>
            </Button>
        </Link>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label }}
              >
                <span>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
            {isUserLoading ? (
                <>
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </>
            ) : user ? (
                <>
                    <Avatar className="h-9 w-9">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Avatar'} />}
                        <AvatarFallback>
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold">{user.displayName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </>
            ) : null}
        </div>
        <SidebarMenuButton tooltip={{ children: 'Sair' }} onClick={handleLogout}>
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
