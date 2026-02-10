'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppSidebar />
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
