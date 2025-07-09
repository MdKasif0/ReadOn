
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
    if (page) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setArticles([]); // Clear articles for new search/category
      setNextPage(null);
    }
    setError(null);

    const { query, singleCategory, multiCategories, country, language } = getFilterParams();
    const categoriesArray = multiCategories ? multiCategories.split(',') : [];

    // Set page title (only on first load)
    if (!page) {
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
    
    // Offline/cache logic (only for initial category load)
    const isSearch = !!query || (categoriesArray && categoriesArray.length > 0);
    const cacheCategory = singleCategory || 'top';
    if (!isSearch && !page) {
        const cachedArticles = await getArticlesByCategory(cacheCategory);
        if (cachedArticles && cachedArticles.length > 0) {
            setArticles(cachedArticles);
            setIsLoading(false); // Show cache immediately
        }
    }

    try {
      const searchInput = {
        query: query || undefined,
        category: !isSearch ? (singleCategory || 'top') : undefined,
        categories: isSearch ? (categoriesArray || undefined) : undefined,
        language: language || defaultLanguage,
        country: country || defaultCountry,
        page: page || undefined,
      };
      
      const result = await articleSearch(searchInput);

      setArticles(prev => {
        const existingUrls = new Set(prev.map(a => a.url));
        const newArticles = result.results.filter(a => !existingUrls.has(a.url));
        return [...prev, ...newArticles];
      });
      setNextPage(result.nextPage);
      
      // Cache results for offline use
      if (!isSearch && result.results.length > 0) {
        await saveArticles(cacheCategory, result.results);
      }

    } catch (err) {
      console.error('Failed to fetch articles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news articles. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getFilterParams, defaultCountry, defaultLanguage]);

  // Effect to handle fetching articles when search parameters change.
  // The dependency array includes a serialized version of searchParams to ensure it reruns correctly.
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

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
        
        {isLoading ? (
          <ArticleGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </ArticleGrid>
        ) : error ? (
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
                We couldn't find any articles for your criteria. Please try again with different filters.
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
