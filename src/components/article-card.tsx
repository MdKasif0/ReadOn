import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const bgColors = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export function ArticleCard({ article, index }: ArticleCardProps) {
  const bgColor = index !== undefined ? bgColors[index % bgColors.length] : undefined;
  
  return (
    <Card className={cn(
      "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      bgColor
    )}>
      <CardHeader className="p-0">
        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block aspect-video w-full relative overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint="news article"
            />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg leading-snug">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className={cn(
          "text-sm truncate",
          bgColor ? "text-card-foreground/80" : "text-muted-foreground"
        )}>
            <Link href={article.source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{article.source.name}</Link>
        </div>
        <BookmarkButton article={article} />
      </CardFooter>
    </Card>
  );
}
