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
import {
  Bookmark,
  BookOpen,
  Globe,
  HeartPulse,
  Landmark,
  Lightbulb,
  Rocket,
  Palette,
  Atom,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "General", icon: Globe, href: "/?category=general" },
  { name: "Business", icon: Landmark, href: "/?category=business" },
  { name: "Technology", icon: Rocket, href: "/?category=technology" },
  { name: "Entertainment", icon: Palette, href: "/?category=entertainment" },
  { name: "Sports", icon: Atom, href: "/?category=sports" },
  { name: "Science", icon: Lightbulb, href: "/?category=science" },
  { name: "Health", icon: HeartPulse, href: "/?category=health" },
];

export function MainSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/" aria-label="Back to home">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {categories.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={
                    !pathname.startsWith("/bookmarks") &&
                    (currentCategory === item.name.toLowerCase() ||
                    (!currentCategory && item.name === "General"))
                  }
                  tooltip={item.name}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/bookmarks">
                    <SidebarMenuButton 
                        isActive={pathname === "/bookmarks"}
                        tooltip="Bookmarks"
                    >
                        <Bookmark />
                        <span>Bookmarks</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
