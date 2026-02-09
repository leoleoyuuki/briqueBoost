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
    <Sidebar className='hidden lg:flex lg:flex-col'>
      <SidebarHeader className='p-4'>
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            BriqueBoost
          </h2>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                className={cn(
                    "w-full justify-start h-10",
                    isActive(item.href) && "bg-primary/10 text-primary",
                    !isActive(item.href) && "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
         {/* <div className='p-4 rounded-lg bg-card border'>
            <h3 className='font-semibold'>Obtenha análises detalhadas para obter ajuda</h3>
            <p className='text-sm text-muted-foreground'>Atualize para o Pro</p>
            <Button size='sm' className='w-full mt-2'>Atualizar</Button>
         </div>
         <div className='flex items-center justify-between'>
            <Label htmlFor='dark-mode-toggle'>Modo Escuro</Label>
            <Switch id="dark-mode-toggle" />
         </div> */}
      </SidebarFooter>
    </Sidebar>
  );
}
