import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
