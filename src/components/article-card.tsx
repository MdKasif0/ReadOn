
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  index: number;
}

const cardColorSuffixes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

// By defining the full class names here, we ensure that Tailwind's JIT compiler
// can detect and generate the necessary CSS.
const backgroundClasses: { [key: string]: string } = {
  "1": "bg-card-bg-1",
  "2": "bg-card-bg-2",
  "3": "bg-card-bg-3",
  "4": "bg-card-bg-4",
  "5": "bg-card-bg-5",
  "6": "bg-card-bg-6",
  "7": "bg-card-bg-7",
  "8": "bg-card-bg-8",
  "9": "bg-card-bg-9",
  "10": "bg-card-bg-10",
};

const borderClasses: { [key: string]: string } = {
    "1": "border-card-bg-1",
    "2": "border-card-bg-2",
    "3": "border-card-bg-3",
    "4": "border-card-bg-4",
    "5": "border-card-bg-5",
    "6": "border-card-bg-6",
    "7": "border-card-bg-7",
    "8": "border-card-bg-8",
    "9": "border-card-bg-9",
    "10": "border-card-bg-10",
};

export function ArticleCard({ article, index }: ArticleCardProps) {
  const articleUrl = encodeURIComponent(article.url);
  const colorSuffix = cardColorSuffixes[index % cardColorSuffixes.length];
  const bgColorClass = backgroundClasses[colorSuffix];
  const borderColorClass = borderClasses[colorSuffix];

  return (
    <Card className={cn("flex flex-col overflow-hidden rounded-2xl shadow-lg border-2 bg-transparent", borderColorClass)}>
      <Link href={`/article?url=${articleUrl}`}>
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
      <div className={cn("flex flex-col flex-grow p-4 text-accent-foreground", bgColorClass)}>
        <h2 className="text-xl font-bold leading-tight line-clamp-3">
          <Link href={`/article?url=${articleUrl}`} className="hover:underline">
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
            </div>
        </div>
      </div>
    </Card>
  );
}
