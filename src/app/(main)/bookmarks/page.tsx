
"use client";

import { useState, useMemo } from "react";
import { useBookmarks } from "@/providers/bookmarks-provider";
import { Info, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

const cardColors = [
  "bg-[#FEF5D9] text-black",
  "bg-[#FCEAF1] text-black",
  "bg-[#E6F4F1] text-black",
  "bg-[#F0EAF9] text-black",
];

const cardRotations = [
  "rotate-2",
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-3",
  "-rotate-3",
];

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
    <div className="flex h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-10 p-4 pt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Saved News</h1>
        </div>
        <div className="relative mt-4 w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search news"
            className="h-12 rounded-full border-none bg-neutral-800 pl-12 text-white placeholder:text-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {bookmarks.length > 0 ? (
          filteredBookmarks.length > 0 ? (
            <div className="relative h-full">
                {filteredBookmarks.map((bookmark, index) => {
                    const articleUrl = encodeURIComponent(bookmark.article.url);
                    return (
                        <Link href={`/article?url=${articleUrl}`} key={bookmark.article.url}>
                            <div
                                className={cn(
                                "absolute w-[90%] left-[5%] p-6 rounded-3xl shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:!rotate-0 hover:z-20",
                                cardColors[index % cardColors.length],
                                cardRotations[index % cardRotations.length]
                                )}
                                style={{
                                    top: `${index * 50}px`,
                                    zIndex: filteredBookmarks.length - index,
                                }}
                            >
                                <h2 className="text-2xl font-bold leading-tight line-clamp-3">
                                    {bookmark.article.title}
                                </h2>
                                <p className="mt-2 text-sm text-black/60 line-clamp-2">
                                    {bookmark.article.description}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
          ) : (
             <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/50 p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-neutral-500" />
              <h2 className="text-xl font-semibold text-white">
                No Matching Saved Articles
              </h2>
              <p className="mt-2 text-neutral-400">
                Try a different search term.
              </p>
            </div>
          )
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/50 p-12 text-center">
            <Info className="mb-4 h-12 w-12 text-neutral-500" />
            <h2 className="text-xl font-semibold text-white">
              No Saved Articles Yet
            </h2>
            <p className="mt-2 text-neutral-400">
              You can save articles from the feed to find them here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
