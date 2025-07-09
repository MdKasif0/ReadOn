"use client";

import { SearchSheet } from "./search-sheet";

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 pt-6 md:hidden">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      <div className="flex items-center gap-1">
        <SearchSheet />
      </div>
    </div>
  );
}
