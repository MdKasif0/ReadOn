
"use client";

import { useState, useMemo } from "react";
import { useBookmarks } from "@/providers/bookmarks-provider";
import { Info, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StackedBookmarkCard } from "@/components/stacked-bookmark-card";

const cardColors = [
    "bg-card-stack-1",
    "bg-card-stack-2",
    "bg-card-stack-3",
    "bg-card-stack-4",
    "bg-card-stack-5",
];

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredBookmarks = useMemo(() => {
    const sortedBookmarks = [...bookmarks].sort((a, b) => b.addedAt - a.addedAt);
    if (!searchQuery) {
      return sortedBookmarks;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedBookmarks.filter((bookmark) => {
      const inTitle = bookmark.article.title.toLowerCase().includes(lowercasedQuery);
      const inDescription = bookmark.article.description?.toLowerCase().includes(lowercasedQuery) ?? false;
      const inNotes = bookmark.notes?.toLowerCase().includes(lowercasedQuery) ?? false;
      const inTags = bookmark.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery)) ?? false;
      return inTitle || inDescription || inNotes || inTags;
    });
  }, [bookmarks, searchQuery]);


  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 p-4 pt-6 bg-background/80 backdrop-blur-sm">
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
            placeholder="Search saved articles..."
            className="h-12 rounded-full border-2 border-border bg-muted pl-11 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-48 pt-8">
        {bookmarks.length > 0 ? (
          filteredBookmarks.length > 0 ? (
            <div className="relative">
                 {filteredBookmarks.map((bookmark, index) => (
                    <div 
                        key={bookmark.article.url}
                        className="relative transition-transform duration-300 ease-out hover:!translate-y-[-10px] hover:!rotate-0 mt-4"
                        style={{
                            transform: `rotate(${index * 1.5}deg) translateY(${index * 20}px)`,
                            zIndex: filteredBookmarks.length - index,
                        }}
                    >
                        <StackedBookmarkCard
                            bookmark={bookmark}
                            className={cardColors[index % cardColors.length]}
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
