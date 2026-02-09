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
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');

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
        {/* User info and logout moved to AppHeader */}
      </SidebarFooter>
    </Sidebar>
  );
}
