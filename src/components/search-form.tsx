"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchForm({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  // Syncs the input field if the URL is changed by other means (e.g. back/forward buttons)
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    if (trimmedQuery && trimmedQuery !== (searchParams.get("q") || "")) {
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
      if (onSearch) {
        onSearch();
      }
    } else if (!trimmedQuery && searchParams.get("q")) {
      router.push(`/`);
      if (onSearch) {
        onSearch();
      }
    }
  }, [debouncedQuery, router, onSearch, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(query.trim())}`);
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
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
  );
}
