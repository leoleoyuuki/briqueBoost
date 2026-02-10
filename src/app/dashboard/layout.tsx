'use client';

import type { ReactNode } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function DashboardContent({ children }: { children: ReactNode }) {
    const { open, setOpen, isMobile } = useSidebar();

    const handleContentClick = () => {
        // Only close if it's open and we are not on mobile, where the sheet overlay handles closing.
        if (open && !isMobile) {
            setOpen(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col" onClick={handleContentClick}>
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
        </div>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <DashboardContent>
          {children}
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
