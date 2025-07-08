
import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";

interface ArticleGridProps {
  articles?: Article[];
  children?: React.ReactNode;
}

export function ArticleGrid({ articles, children }: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {articles ? articles.map((article, index) => <ArticleCard key={article.url + index} article={article} index={index} />) : children}
    </div>
  );
}
