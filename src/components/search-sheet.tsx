'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SearchForm } from '@/components/search-form';

export function SearchSheet() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-6 w-6 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <div className="mt-8">
            <SearchForm onSearch={() => setIsOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
