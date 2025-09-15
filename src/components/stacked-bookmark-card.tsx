
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Bookmark } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface StackedBookmarkCardProps {
    bookmark: Bookmark;
    className?: string;
}

export function StackedBookmarkCard({ bookmark, className }: StackedBookmarkCardProps) {
  const { article } = bookmark;
  const articleUrl = encodeURIComponent(article.url);

  return (
    <Link href={`/article?url=${articleUrl}`} className="block group">
        <Card className={cn("overflow-hidden rounded-3xl h-[280px] shadow-lg flex flex-col text-black dark:text-black", className)}>
            <div className="relative h-2/5 w-full overflow-hidden">
                <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <CardContent className="flex flex-col justify-center flex-1 p-6">
                <div>
                    <h2 className="text-xl font-bold leading-tight line-clamp-3">
                        {article.title}
                    </h2>
                    <p className="mt-2 text-sm line-clamp-2 text-black/60">
                        {article.description}
                    </p>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}
