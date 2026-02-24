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
import { Logo } from '@/components/logo';
import { menuItems, adminMenuItems } from '@/lib/nav-items';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Separator } from '@/components/ui/separator';

const ADMIN_UID = 'jkpKhUbIIiSiy2yZdgYxWMzv7xF3';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-800">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-bold text-white font-headline group-data-[state=collapsed]/sidebar-wrapper:hidden">
            BriqueBoost
          </h2>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={isActive(item.href)}
                className={cn(
                  'w-full justify-start h-11 rounded-md text-base font-medium border-l-4',
                  isActive(item.href)
                    ? 'bg-slate-800/50 border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                tooltip={{ children: item.label }}
              >
                  <item.icon className="w-5 h-5" />
                  <span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
                    {item.label}
                  </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}

        {user?.uid === ADMIN_UID && (
            <>
                <Separator className="my-4 bg-slate-800" />
                <p className="px-3 text-xs font-semibold text-slate-500 tracking-wider group-data-[state=collapsed]/sidebar-wrapper:hidden">ADMIN</p>
                {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                        <Link href={item.href}>
                        <SidebarMenuButton
                            isActive={isActive(item.href)}
                            className={cn(
                            'w-full justify-start h-11 rounded-md text-base font-medium border-l-4',
                            isActive(item.href)
                                ? 'bg-slate-800/50 border-blue-500 text-white'
                                : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                            tooltip={{ children: item.label }}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
                                {item.label}
                            </span>
                        </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </>
        )}
      </SidebarMenu>

      <SidebarFooter className="p-4 space-y-4">
        {/* Footer content can be added here */}
      </SidebarFooter>
    </Sidebar>
  );
}
