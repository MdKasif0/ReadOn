'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { articleSearch } from '@/ai/flows/article-search';
import type { Article } from '@/lib/types';
import { ArticleGrid } from '@/components/article-grid';
import { ArticleSkeleton } from '@/components/article-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Loader2 } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { newsCategories } from '@/lib/categories';
import { useSettings } from '@/providers/settings-provider';
import { getArticlesByCategory, saveArticles } from '@/lib/indexed-db';
import { Button } from '@/components/ui/button';

function NewsFeed() {
  const searchParams = useSearchParams();
  const { language: defaultLanguage, country: defaultCountry } = useSettings();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('For You');
  const [nextPage, setNextPage] = useState<string | null>(null);

  const getFilterParams = useCallback(() => {
    return {
      query: searchParams.get('q'),
      singleCategory: searchParams.get('category'),
      multiCategories: searchParams.get('categories'),
      country: searchParams.get('country'),
      language: searchParams.get('language'),
    };
  }, [searchParams]);

  const fetchArticles = useCallback(async (page?: string) => {
    const isLoadMore = !!page;
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    const { query, singleCategory, multiCategories, country, language } = getFilterParams();
    const categoriesArray = multiCategories ? multiCategories.split(',') : [];
    const isSearch = !!query || categoriesArray.length > 0;

    // Set page title
    if (!isLoadMore) {
      if (query) {
        setPageTitle(`Search results for "${query}"`);
      } else if (categoriesArray.length > 0) {
        const categoryNames = newsCategories
          .filter(c => categoriesArray.includes(c.slug))
          .map(c => c.name)
          .join(' & ');
        setPageTitle(categoryNames || 'Filtered News');
      } else if (singleCategory) {
        const categoryDetails = newsCategories.find(c => c.slug === singleCategory);
        setPageTitle(categoryDetails?.name || 'For You');
      } else {
        setPageTitle('For You');
      }
    }
    
    // OFFLINE FIRST: Try to load from IndexedDB first for category views
    const cacheCategory = singleCategory || 'top';
    if (!isSearch && !isLoadMore) {
      const cachedData = await getArticlesByCategory(cacheCategory);
      if (cachedData && cachedData.articles.length > 0) {
        setArticles(cachedData.articles);
        setIsLoading(false); // Show cache immediately

        // Check if cache is fresh enough (e.g., < 2 hours old)
        const cacheAge = cachedData.fetchedAt ? Date.now() - new Date(cachedData.fetchedAt).getTime() : Infinity;
        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

        if (cacheAge < TWO_HOURS_IN_MS) {
            console.log(`Cache for ${cacheCategory} is fresh. Halting network fetch.`);
            setError(null);
            setNextPage(null); // No pagination for cached views
            setIsLoading(false);
            setIsLoadingMore(false);
            return; // Exit early, we have fresh data
        }
        console.log(`Cache for ${cacheCategory} is stale. Fetching from network.`);
      }
    }

    try {
      const searchInput = {
        query: query || undefined,
        category: !isSearch ? (singleCategory || 'top') : undefined,
        categories: isSearch ? (categoriesArray.length > 0 ? categoriesArray : undefined) : undefined,
        language: language || defaultLanguage,
        country: country || defaultCountry,
        page: page || undefined,
      };
      
      const result = await articleSearch(searchInput);
      
      // If loading more, append results. Otherwise, replace.
      setArticles(prev => (isLoadMore ? [...prev, ...result.results] : result.results));
      setNextPage(result.nextPage);
      
      // Update IndexedDB with fresh data for offline use
      if (!isSearch && result.results.length > 0 && result.fetchedAt) {
        await saveArticles(cacheCategory, result.results, result.fetchedAt);
      }

    } catch (err) {
      console.error('Failed to fetch articles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news articles. Please try again later.';
      // Only set error if we don't already have articles to show
      if (articles.length === 0) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getFilterParams, defaultCountry, defaultLanguage, articles.length]);

  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilterParams, defaultCountry, defaultLanguage]);


  const handleLoadMore = () => {
    if (nextPage) {
      fetchArticles(nextPage);
    }
  };

  return (
    <div>
      <div className="md:hidden">
        <MobileHeader title={pageTitle} />
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 hidden text-3xl font-bold tracking-tight text-primary md:block">
          {pageTitle}
        </h1>
        
        {isLoading && articles.length === 0 ? (
          <ArticleGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </ArticleGrid>
        ) : error && articles.length === 0 ? (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching News</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : articles.length > 0 ? (
          <>
            <ArticleGrid articles={articles} />
            {nextPage && (
              <div className="mt-8 flex justify-center">
                <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">
                No Articles Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                Please check back later, or try a different category.
              </p>
            </div>
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
