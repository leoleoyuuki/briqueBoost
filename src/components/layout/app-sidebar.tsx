'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { menuItems } from '@/lib/nav-items';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <Sidebar className='hidden lg:flex lg:flex-col bg-slate-900/50 backdrop-blur-xl border-r border-slate-800'>
      <SidebarHeader className='p-4 h-20'>
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-bold text-white font-headline">
            BriqueBoost
          </h2>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                className={cn(
                    "w-full justify-start h-11 rounded-xl text-base",
                    isActive(item.href) && "bg-blue-600 text-white font-semibold",
                    !isActive(item.href) && "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span>
                  <item.icon className='w-5 h-5' />
                  <span>{item.label}</span>
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter className="p-4 space-y-4">
        {/* Footer content can be added here */}
      </SidebarFooter>
    </Sidebar>
  );
}
