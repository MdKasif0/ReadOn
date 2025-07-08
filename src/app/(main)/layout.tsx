"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { PageHeader } from "@/components/page-header";
import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBottomNav = pathname !== '/article';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <MainSidebar />
        </div>
        <div className="flex-1 pb-16 md:pb-0">
          <div className="hidden md:flex">
            <PageHeader />
          </div>
          <main>{children}</main>
        </div>
      </div>
      {showBottomNav && <BottomNav />}
    </SidebarProvider>
  );
}
