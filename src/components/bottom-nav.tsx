
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full flex justify-center pb-4 pointer-events-none md:hidden">
      <div className="grid h-full w-full max-w-[280px] grid-cols-4 rounded-full bg-neutral-800/80 p-2 shadow-lg backdrop-blur-md pointer-events-auto">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/feed" && (pathname.startsWith("/feed") || pathname === "/")) ||
            (item.href !== "/feed" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group inline-flex flex-col items-center justify-center p-2 font-medium transition-colors duration-200"
              )}
            >
              <div className={cn("relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                isActive ? 'bg-white' : 'bg-transparent'
              )}>
                <item.icon className={cn("h-5 w-5 transition-colors", 
                  isActive ? 'text-black' : 'text-neutral-400 group-hover:text-white'
                )} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
