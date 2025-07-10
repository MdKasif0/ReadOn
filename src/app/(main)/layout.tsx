
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { PageHeader } from "@/components/page-header";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Conditionally render the app shell.
  // The landing page at `/` will not have the sidebar, header, etc.
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  const isFeedPage = pathname.startsWith('/feed');
  // Only show the app shell for non-feed and non-article pages on desktop
  const showDesktopShell = !isFeedPage && pathname !== '/article';

  if (isFeedPage) {
     return (
        <div className="bg-black">
            {children}
            <BottomNav />
        </div>
     )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <div className={cn("hidden", showDesktopShell && "md:block")}>
          <MainSidebar />
        </div>
        <div className="flex-1 pb-16 md:pb-0">
          <div className={cn("hidden", showDesktopShell && "md:flex")}>
            <PageHeader />
          </div>
          <main>{children}</main>
        </div>
      </div>
       <BottomNav />
    </SidebarProvider>
  );
}
