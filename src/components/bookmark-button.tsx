
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
  className?: string;
  activeClassName?: string;
}

export function BookmarkButton({ article, className, activeClassName }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const router = useRouter();

  const bookmarked = isBookmarked(article.url);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const buttonClasses = cn(
    "rounded-full text-foreground",
    className,
    bookmarked && "text-primary fill-primary",
    bookmarked && activeClassName,
  );

  if (!user) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" className={cn("text-muted-foreground/50 cursor-not-allowed", className)} disabled>
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
            className={buttonClasses}
          >
            <Bookmark className={cn("h-5 w-5 transition-transform", bookmarked && "scale-110")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
