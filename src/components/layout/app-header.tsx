'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  const pathname = usePathname();
  const getTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/inventory/new')) return 'Adicionar Novo Item';
    if (pathname.startsWith('/inventory')) return 'Detalhes do Item';
    return 'BriqueBoost';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold font-headline md:text-xl">
        {getTitle()}
      </h1>
      {/* Future additions: Search bar, user menu for mobile */}
    </header>
  );
}
