"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "News", icon: Leaf },
  { href: "/bookmarks", label: "Bookmarks", icon: Heart },
  { href: "/account", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full flex justify-center pb-4 pointer-events-none md:hidden">
      <div className="grid h-full w-full max-w-xs grid-cols-3 rounded-full bg-card p-2 shadow-lg pointer-events-auto">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group inline-flex flex-col items-center justify-center py-2 px-4 font-medium transition-colors duration-200",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground/80 hover:text-foreground"
              )}
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
