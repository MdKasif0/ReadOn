import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  index: number;
}

const cardColors = [
  "bg-card-bg-1",
  "bg-card-bg-2",
  "bg-card-bg-3",
  "bg-card-bg-4",
];

export function ArticleCard({ article, index }: ArticleCardProps) {
  const articleData = encodeURIComponent(JSON.stringify(article));
  const colorClass = cardColors[index % cardColors.length];

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl shadow-lg border-2 border-accent bg-transparent">
      <Link href={`/article?data=${articleData}`}>
        <div className="overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
            className=""
            data-ai-hint="space ice"
          />
        </div>
      </Link>
      <div className={cn("flex flex-col flex-grow p-4 text-accent-foreground", colorClass)}>
        <h2 className="text-xl font-bold leading-tight line-clamp-3">
          <Link href={`/article?data=${articleData}`} className="hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm text-accent-foreground/80 line-clamp-5">
          {article.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
            <div className="text-xs truncate font-medium">
                <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{article.source.name}</a>
            </div>
            <div className="flex items-center">
                <BookmarkButton article={article} />
                <Button variant="ghost" size="icon" className="rounded-full text-accent-foreground hover:bg-black/10 active:bg-black/20">
                    <Headphones className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </Card>
  );
}
