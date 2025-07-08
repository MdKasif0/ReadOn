"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { articleSearch } from "@/ai/flows/article-search";
import type { Article } from "@/lib/types";
import { ArticleGrid } from "@/components/article-grid";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { newsCategories } from "@/lib/categories";
import { useSettings } from "@/providers/settings-provider";

function NewsFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const { language, country } = useSettings();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("For You");

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      const isSearch = !!query;

      if (isSearch) {
        setPageTitle(`Search results for "${query}"`);
        result = await articleSearch({ query, language, country });
      } else {
        const currentCategorySlug = category || 'general';
        const categoryDetails = newsCategories.find((c) => c.slug === currentCategorySlug);
        setPageTitle(categoryDetails?.name || "For You");
        result = await articleSearch({ category: currentCategorySlug, language, country });
      }

      setArticles(result.results);
      if (result.results.length === 0) {
        setError("We couldn't find any articles. Please try again later or select a different category.");
      }

    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Failed to fetch news articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [category, query, language, country]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div>
      <div className="md:hidden">
        <MobileHeader title="Discover" />
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 hidden text-3xl font-bold tracking-tight text-primary md:block">
          {pageTitle}
        </h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
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
          !error && <ArticleGrid articles={articles} />
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <NewsFeed />
    </Suspense>
  );
}
