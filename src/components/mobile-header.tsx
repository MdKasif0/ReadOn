"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchForm } from "./search-form";

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 pt-6 md:hidden">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-6 w-6 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search articles</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <SearchForm onSearch={() => setIsSearchOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
