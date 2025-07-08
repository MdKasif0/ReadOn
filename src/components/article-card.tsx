import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { Headphones } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border-none bg-transparent shadow-lg">
      <div className="w-full">
        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
              data-ai-hint="space ice"
            />
        </Link>
      </div>
      <div className="flex flex-col flex-grow p-4 bg-accent text-accent-foreground">
        <h2 className="text-2xl font-bold leading-tight">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 text-sm text-accent-foreground/80 flex-grow">
          {article.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
            <div className="text-xs truncate font-medium">
                <Link href={article.source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{article.source.name}</Link>
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
