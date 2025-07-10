
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FilterSheet } from "./filter-sheet";

export function SearchForm({ onSearch }: { onSearch?: (query: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);
  const isFeedPage = useSearchParams().get('category') !== null || searchParams.get('q') !== null || usePathname() === '/feed';


  // Syncs the input field if the URL is changed by other means (e.g. back/forward buttons)
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    
    // If a custom onSearch handler is provided, use it
    if (onSearch) {
        if (trimmedQuery) {
            onSearch(trimmedQuery);
        }
        return;
    }

    // Default behavior: redirect for global search
    if (trimmedQuery && trimmedQuery !== (searchParams.get("q") || "")) {
      router.push(`/feed?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (!trimmedQuery && searchParams.get("q")) {
      router.push(`/feed`);
    }
  }, [debouncedQuery, router, onSearch, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (onSearch) {
        if (trimmedQuery) {
            onSearch(trimmedQuery);
        }
    } else if (trimmedQuery) {
        router.push(`/feed?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <div className="flex w-full max-w-lg items-center gap-2">
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-10 h-10"
                />
            </div>
        </form>
        {isFeedPage && <FilterSheet />}
    </div>
  );
}
