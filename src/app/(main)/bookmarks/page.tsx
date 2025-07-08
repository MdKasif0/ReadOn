"use client";

import { useBookmarks } from "@/providers/bookmarks-provider";
import { ArticleGrid } from "@/components/article-grid";
import { Info } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary">
        Your Bookmarks
      </h1>
      {bookmarks.length > 0 ? (
        <ArticleGrid articles={bookmarks} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
          <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground">
            No Bookmarks Yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            You can bookmark articles from the main page.
          </p>
        </div>
      )}
    </div>
  );
}
