'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkButton } from '@/components/bookmark-button';
import type { Bookmark } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { EditBookmarkSheet } from './edit-bookmark-sheet';
import { FilePenLine, MessageSquareQuote } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const { article, notes, tags } = bookmark;
  const articleData = encodeURIComponent(JSON.stringify(article));

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
      <Link href={`/article?data=${articleData}`} className="group">
        <div className="relative overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={400}
            height={225}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-bold leading-tight line-clamp-2">
          <Link href={`/article?data=${articleData}`} className="hover:underline">
            {article.title}
          </Link>
        </h2>
        <div className="mt-2 flex-1 space-y-3">
          {notes && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquareQuote className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-3">{notes}</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="max-w-[300px] whitespace-normal">
                  <p>{notes}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-2">
          <div className="truncate text-xs text-muted-foreground">
            <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {article.source.name}
            </a>
          </div>
          <div className="flex items-center">
            <EditBookmarkSheet bookmark={bookmark}>
                <Button variant="ghost" size="icon">
                    <FilePenLine className="h-5 w-5" />
                </Button>
            </EditBookmarkSheet>
            <BookmarkButton article={article} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
