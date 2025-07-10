
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useBookmarks } from "@/providers/bookmarks-provider";
import { Info, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkCard } from "@/components/bookmark-card";
import { cn } from "@/lib/utils";

const cardColors = [
    "bg-card-stack-1", 
    "bg-card-stack-2", 
    "bg-card-stack-3", 
    "bg-card-stack-4", 
    "bg-card-stack-5"
];

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTransforms, setScrollTransforms] = useState<string[]>([]);

  const filteredBookmarks = useMemo(() => {
    const sortedBookmarks = [...bookmarks].sort((a, b) => b.addedAt - a.addedAt);
    if (!searchQuery) {
      return sortedBookmarks;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedBookmarks.filter((bookmark) => {
      const inTitle = bookmark.article.title.toLowerCase().includes(lowercasedQuery);
      const inDescription = bookmark.article.description?.toLowerCase().includes(lowercasedQuery) ?? false;
      return inTitle || inDescription;
    });
  }, [bookmarks, searchQuery]);

  const updateCardTransforms = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const newTransforms = filteredBookmarks.map((_, index) => {
      const cardElement = container.children[index] as HTMLElement;
      if (!cardElement) return '';

      const cardTop = cardElement.offsetTop - scrollTop;
      const cardHeight = cardElement.offsetHeight;
      
      const isVisible = cardTop < containerHeight && (cardTop + cardHeight) > 0;
      if (!isVisible) return scrollTransforms[index] || `rotate(0deg) translateY(0px)`;
      
      // Rotation: a value between -5 and 5 degrees based on index
      const rotation = (index % 2 === 0 ? 1 : -1) * (2 + (index % 5)); 
      
      // Vertical translation based on scroll position
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - (cardElement.offsetTop - containerHeight / 2)) / (containerHeight / 2)));
      const translateY = -scrollFactor * 30;

      return `rotate(${rotation}deg) translateY(${translateY}px)`;
    });

    setScrollTransforms(newTransforms);
  }, [filteredBookmarks, scrollTransforms]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
        container.addEventListener('scroll', updateCardTransforms);
        updateCardTransforms(); // Initial call
        return () => container.removeEventListener('scroll', updateCardTransforms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBookmarks]);


  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 p-4 pt-6">
        <div className="mb-4 flex items-center">
            <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10 shrink-0 rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="ml-2 text-2xl font-bold tracking-tight">
                Saved News
            </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            className="h-12 rounded-full border-2 border-border bg-muted pl-11 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto px-4 pb-24 pt-4"
        style={{ perspective: '1000px' }}
      >
        {bookmarks.length > 0 ? (
          filteredBookmarks.length > 0 ? (
            <div className="relative space-y-[-180px]">
              {filteredBookmarks.map((bookmark, index) => (
                <div 
                    key={bookmark.article.url}
                    className="transition-transform duration-300 ease-out"
                    style={{ transform: scrollTransforms[index] }}
                >
                    <BookmarkCard
                      bookmark={bookmark}
                      className={cn(cardColors[index % cardColors.length], "text-black")}
                      displayMode="stacked"
                    />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold">
                No Matching Saved Articles
              </h2>
              <p className="mt-2 text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          )
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center">
            <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold">
              No Saved Articles Yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              You can save articles from the feed to find them here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
