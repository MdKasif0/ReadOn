"use client";

import { useState, useEffect, Suspense } from "react";
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

const categoriesForTabs = newsCategories.map((category) => ({
  name: category.name,
  href: `/?category=${category.slug}`,
}));

function NewsFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("For You");

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      let searchKeywords: string;
      if (query) {
        searchKeywords = query;
        setPageTitle(`Search results for "${query}"`);
      } else {
        const currentCategorySlug = category || "general";
        const categoryDetails = newsCategories.find(
          (c) => c.slug === currentCategorySlug
        );

        if (currentCategorySlug === "general") {
          searchKeywords = "latest world news";
        } else {
          searchKeywords = `top news in ${categoryDetails?.name}`;
        }
        setPageTitle(categoryDetails?.name || "For You");
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
