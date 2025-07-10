
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
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BookmarkCardProps {
    bookmark: Bookmark;
    className?: string;
    displayMode?: 'grid' | 'stacked' | 'search';
}

export function BookmarkCard({ bookmark, className, displayMode = 'grid' }: BookmarkCardProps) {
  const { article, notes, tags } = bookmark;
  const articleUrl = encodeURIComponent(article.url);
  const router = useRouter();

  const handleSourceClick = (e: React.MouseEvent) => {
    // Stop the click from propagating to the parent Link component
    e.preventDefault();
    e.stopPropagation();
    window.open(article.source.url, '_blank', 'noopener,noreferrer');
  };

  if (displayMode === 'stacked') {
      return (
        <Link href={`/article?url=${articleUrl}`} className="block group">
            <Card className={cn("overflow-hidden rounded-3xl h-[240px] shadow-lg flex flex-col", className)}>
                 <div className="relative h-2/5 w-full overflow-hidden">
                    <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <CardContent className="flex flex-col justify-center flex-1 p-4">
                    <div>
                        <h2 className="text-lg font-bold leading-tight line-clamp-2">
                            {article.title}
                        </h2>
                        <p className="mt-1 text-sm line-clamp-2 text-black/60">
                            {article.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
      )
  }

  const CardWrapper = displayMode === 'search' ? Link : 'div';
  const cardWrapperProps = displayMode === 'search' ? { href: `/article?url=${articleUrl}`, className: 'group' } : {};

  return (
    <CardWrapper {...cardWrapperProps}>
        <Card className={cn("flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl h-full", className)}>
        <div className="relative overflow-hidden">
            <Image
                src={article.imageUrl}
                alt={article.title}
                width={400}
                height={225}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        <CardContent className="flex flex-1 flex-col p-4">
            <h2 className="text-lg font-bold leading-tight line-clamp-2 hover:underline">
            {article.title}
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
                 <span onClick={displayMode === 'search' ? handleSourceClick : undefined} className="hover:underline cursor-pointer">
                    {article.source.name}
                 </span>
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
    </CardWrapper>
  );
}
