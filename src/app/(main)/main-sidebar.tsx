
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Bookmark } from "lucide-react";
import { newsCategories } from "@/lib/categories";

export function MainSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/feed">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {newsCategories.map((item) => (
            <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === '/feed' &&
                    !searchParams.get('q') &&
                    !searchParams.get('categories') &&
                    (currentCategory === item.slug ||
                      (!currentCategory && item.slug === "top"))
                  }
                  tooltip={item.name}
                >
                  <Link href={`/feed?category=${item.slug}`}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild
                    isActive={pathname === "/bookmarks"}
                    tooltip="Bookmarks"
                >
                    <Link href="/bookmarks">
                        <Bookmark />
                        <span>Bookmarks</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
