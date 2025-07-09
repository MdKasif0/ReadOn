"use client";

import { useState, useMemo } from "react";
import { useBookmarks } from "@/providers/bookmarks-provider";
import { Info, Search } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { Input } from "@/components/ui/input";
import { BookmarkCard } from "@/components/bookmark-card";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) {
      return bookmarks;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) => {
      const inTitle = bookmark.article.title.toLowerCase().includes(lowercasedQuery);
      const inDescription = bookmark.article.description.toLowerCase().includes(lowercasedQuery);
      const inNotes = bookmark.notes?.toLowerCase().includes(lowercasedQuery);
      const inTags = bookmark.tags?.some((tag) => tag.toLowerCase().includes(lowercasedQuery));
      return inTitle || inDescription || inNotes || inTags;
    });
  }, [bookmarks, searchQuery]);

  return (
    <div>
      <div className="md:hidden">
        <MobileHeader title="Bookmarks" />
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="hidden text-3xl font-bold tracking-tight text-primary md:block">
            Your Bookmarks
          </h1>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search in bookmarks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {bookmarks.length > 0 ? (
          filteredBookmarks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.article.url}
                  bookmark={bookmark}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">
                No Matching Bookmarks
              </h2>
              <p className="mt-2 text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          )
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-foreground">
              No Bookmarks Yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              You can bookmark articles from the feed to save them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
