"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-border/50 bg-background md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-3 font-medium">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="mb-1 h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
