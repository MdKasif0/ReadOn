"use client";

import { useBookmarks } from "@/providers/bookmarks-provider";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  article: Article;
}

export function BookmarkButton({ article }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const router = useRouter();

  const bookmarked = isBookmarked(article.url);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (bookmarked) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  };

  if (!user) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground/50 cursor-not-allowed" disabled>
                <Bookmark className="h-5 w-5" />
             </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Login to bookmark articles</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkClick}
            className={cn("rounded-full text-muted-foreground transition-colors hover:text-primary",
              bookmarked && "text-primary bg-primary/10"
            )}
          >
            <Bookmark className={cn("h-5 w-5 transition-transform", bookmarked && "fill-current scale-110")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
