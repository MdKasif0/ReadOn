import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";

interface ArticleGridProps {
  articles?: Article[];
  children?: React.ReactNode;
}

export function ArticleGrid({ articles, children }: ArticleGridProps) {
  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
      {articles ? articles.map((article, index) => <ArticleCard key={article.url} article={article} index={index} />) : children}
    </div>
  );
}
