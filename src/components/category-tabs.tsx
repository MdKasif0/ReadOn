
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface Category {
  name: string;
  href: string;
}

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const currentCategorySlug = searchParams.get("category") || "general";

  return (
    <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 px-4 pb-3">
            {categories.map((category) => {
                const categorySlug = category.href.split("=")[1];
                const isActive = currentCategorySlug === categorySlug;
                return (
                <Link
                    key={category.name}
                    href={category.href}
                    className={cn(
                        "inline-block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                >
                    {category.name}
                </Link>
                );
            })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
