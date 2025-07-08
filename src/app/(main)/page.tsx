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
import { CategoryTabs } from "@/components/category-tabs";
import { newsCategories } from "@/lib/categories";
import { useSettings } from "@/providers/settings-provider";

const categoriesForTabs = newsCategories.map((category) => ({
  name: category.name,
  href: `/?category=${category.slug}`,
}));

function NewsFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const { language } = useSettings();
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
        // For search, we pass the query and language preference.
        result = await articleSearch({ query, language });
      } else {
        const currentCategorySlug = category || 'general';
        const categoryDetails = newsCategories.find((c) => c.slug === currentCategorySlug);
        setPageTitle(categoryDetails?.name || "For You");
        // For categories, we fetch from the shared Firestore cache.
        // Country/language preferences do not apply to this cached data.
        result = await articleSearch({ category: currentCategorySlug });
      }

      setArticles(result.results);
      if (result.results.length === 0 && !isSearch) {
        setError("No articles found. The cache might be empty. Try running the update script.");
      }

    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Failed to fetch news articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [category, query, language]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div>
      <div className="md:hidden">
        <MobileHeader title="Discover" />
        <CategoryTabs categories={categoriesForTabs} />
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
          <ArticleGrid articles={articles} />
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
