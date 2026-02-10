'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
