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
import { CategoryTabs, type Category } from "@/components/category-tabs";

const categories: Category[] = [
  { name: "For You", href: "/?category=general" },
  { name: "Top Stories", href: "/?category=business" },
  { name: "Tech & Science", href: "/?category=technology" },
  { name: "Entertainment", href: "/?category=entertainment" },
  { name: "Sports", href: "/?category=sports" },
  { name: "Health", href: "/?category=health" },
];

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
      } else if (category) {
        const categoryName =
          categories.find((c) => c.href.includes(`=${category}`))?.name ||
          category;
        searchKeywords = `top news in ${category}`;
        setPageTitle(categoryName);
      } else {
        searchKeywords = "latest world news";
        setPageTitle("For You");
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
        <CategoryTabs categories={categories} />
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
