"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { articleSearch } from "@/ai/flows/article-search";
import type { Article } from "@/lib/types";
import { ArticleGrid } from "@/components/article-grid";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function NewsFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("Top Headlines");

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      let searchKeywords = "latest world news";
      if (query) {
        searchKeywords = query;
        setPageTitle(`Search results for "${query}"`);
      } else if (category) {
        searchKeywords = `top news in ${category}`;
        setPageTitle(
          `${category.charAt(0).toUpperCase() + category.slice(1)}`
        );
      } else {
        setPageTitle("Top Headlines");
      }

      try {
        const result = await articleSearch({ keywords: searchKeywords });
        setArticles(result.results);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch news articles. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [category, query]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary">
        {pageTitle}
      </h1>
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <ArticleGrid>
          {Array.from({ length: 9 }).map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </ArticleGrid>
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsFeed />
    </Suspense>
  );
}
