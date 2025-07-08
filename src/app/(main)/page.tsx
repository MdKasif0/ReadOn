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

  const { country, language } = useSettings();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("For You");

  const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

  const fetchArticles = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    const isSearch = !!query;
    const cacheKey = isSearch
      ? `readon-search-cache-${query}-${language}`
      : `readon-category-cache-${category || "general"}-${country}-${language}`;

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, articles: cachedArticles } = JSON.parse(cached);
          if (Date.now() - timestamp < REFRESH_INTERVAL) {
            setArticles(cachedArticles);
            if (isSearch) {
              setPageTitle(`Search results for "${query}"`);
            } else {
              const categoryDetails = newsCategories.find((c) => c.slug === (category || 'general'));
              setPageTitle(categoryDetails?.name || "For You");
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to read from cache", e);
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      let result;
      if (isSearch) {
        setPageTitle(`Search results for "${query}"`);
        result = await articleSearch({ query, language });
      } else {
        const currentCategorySlug = category || 'general';
        const categoryDetails = newsCategories.find((c) => c.slug === currentCategorySlug);
        setPageTitle(categoryDetails?.name || "For You");
        result = await articleSearch({ category: currentCategorySlug, country, language });
      }

      setArticles(result.results);

      if (result.results.length > 0) {
        try {
          const cacheData = {
            timestamp: Date.now(),
            articles: result.results,
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
          console.error("Failed to write to cache", e);
        }
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      // Fallback to cache on error
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { articles: cachedArticles } = JSON.parse(cached);
          setArticles(cachedArticles);
          setError("Could not fetch latest news. Showing older results.");
        } else {
          setError("Failed to fetch news articles. Please try again later.");
        }
      } catch (cacheError) {
        console.error("Cache fallback failed:", cacheError);
        setError("Failed to fetch news articles. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, query, country, language]);

  useEffect(() => {
    fetchArticles();
    
    // Auto-refresh for category feeds, not searches
    if (!query) {
      const intervalId = setInterval(() => {
        fetchArticles(true);
      }, REFRESH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [fetchArticles, query]);

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
