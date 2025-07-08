'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { articleSearch } from '@/ai/flows/article-search';
import type { Article } from '@/lib/types';
import { ArticleGrid } from '@/components/article-grid';
import { ArticleSkeleton } from '@/components/article-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { newsCategories } from '@/lib/categories';
import { useSettings } from '@/providers/settings-provider';
import { getArticlesByCategory, saveArticles } from '@/lib/indexed-db';

function NewsFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const { language, country } = useSettings();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('For You');

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const isSearch = !!query;
    const currentCategorySlug = category || 'general';
    let hasCache = false;

    // For category pages, first try to load from IndexedDB for an instant UI update
    if (!isSearch) {
      const cachedArticles = await getArticlesByCategory(currentCategorySlug);
      if (cachedArticles && cachedArticles.length > 0) {
        const categoryDetails = newsCategories.find(
          (c) => c.slug === currentCategorySlug
        );
        setPageTitle(categoryDetails?.name || 'For You');
        setArticles(cachedArticles);
        setIsLoading(false); // Stop the main loading spinner, show cached content
        hasCache = true;
      }
    }

    try {
      if (isSearch) {
        setPageTitle(`Search results for "${query}"`);
        const result = await articleSearch({ query, language, country });
        // For search, always overwrite previous results.
        setArticles(result.results);
        if (result.results.length === 0) {
          setError(
            'No articles found for your search. Please try a different query.'
          );
        }
      } else {
        // Category fetches also hit the network to get the latest data.
        const categoryDetails = newsCategories.find(
          (c) => c.slug === currentCategorySlug
        );
        setPageTitle(categoryDetails?.name || 'For You');
        const result = await articleSearch({
          category: currentCategorySlug,
          language,
          country,
        });

        // Only update UI and cache if new articles were actually found.
        // This prevents the "flash" of cached content disappearing if the network call fails or returns empty.
        if (result.results.length > 0) {
          setArticles(result.results);
          await saveArticles(currentCategorySlug, result.results);
        } else if (!hasCache) {
          // If network returns nothing AND we had no cache, then it's an empty state.
          setError(
            "We couldn't find any articles for this category. Please try again later."
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      // Only show a prominent error if we have no cached data to display
      if (!hasCache) {
        setError('Failed to fetch news articles. Please try again later.');
      }
    } finally {
      // If we start with a cache, isLoading is set to false early.
      // If there's no cache, we need to set it to false here after the network call.
      if (!hasCache) {
        setIsLoading(false);
      }
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

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <NewsFeed />
    </Suspense>
  );
}
