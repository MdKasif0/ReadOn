
"use client";

import { useState, useMemo } from "react";
import { useBookmarks } from "@/providers/bookmarks-provider";
import { Info, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MobileHeader } from "@/components/mobile-header";
import { ArticleGrid } from "@/components/article-grid";
import { BookmarkCard } from "@/components/bookmark-card";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) {
      return bookmarks;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) => {
      const inTitle = bookmark.article.title.toLowerCase().includes(lowercasedQuery);
      const inDescription = bookmark.article.description.toLowerCase().includes(lowercasedQuery);
      return inTitle || inDescription;
    });
  }, [bookmarks, searchQuery]);

  return (
    <div>
      <div className="md:hidden">
        <MobileHeader title="Saved Articles" />
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="hidden md:block sticky top-0 z-10 -mx-4 -mt-4 mb-4 bg-background/80 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                Saved Articles
            </h1>
            <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search saved articles..."
                    className="h-12 rounded-full border-2 bg-muted pl-10 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {bookmarks.length > 0 ? (
            filteredBookmarks.length > 0 ? (
              <ArticleGrid>
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.article.url} bookmark={bookmark} />
                ))}
              </ArticleGrid>
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
    </div>
  );
}
