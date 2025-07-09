
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

  // For API-based pagination (live search)
  const [nextPage, setNextPage] = useState<string | null>(null);

  // For frontend-based pagination from cache
  const [allCachedArticles, setAllCachedArticles] = useState<Article[]>([]);
  const ARTICLES_PER_PAGE = 10;

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
      setAllCachedArticles([]);
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
    
    // Branch for live searches (query or multi-category)
    if (isSearch) {
        try {
            const result = await articleSearch({
                query: query || undefined,
                categories: categoriesArray.length > 0 ? categoriesArray : undefined,
                language: language || defaultLanguage,
                country: country || defaultCountry,
                page: page || undefined,
            });
            setArticles(prev => (isLoadMore ? [...prev, ...result.results] : result.results));
            setNextPage(result.nextPage);
        } catch(err) {
            console.error('Failed to fetch live search articles:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news. Please try again later.';
            if (articles.length === 0) {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
        return;
    }
    
    // Branch for single category browsing (offline-first)
    const cacheCategory = singleCategory || 'top';
    
    if (!isLoadMore) {
        // Step 1: Try to load from IndexedDB first.
        const cachedData = await getArticlesByCategory(cacheCategory);
        if (cachedData && cachedData.articles.length > 0) {
            setAllCachedArticles(cachedData.articles);
            setArticles(cachedData.articles.slice(0, ARTICLES_PER_PAGE));
            setIsLoading(false);

            // Step 2: Check if the cache is fresh enough (e.g., < 2 hours old).
            const cacheAge = cachedData.fetchedAt ? Date.now() - new Date(cachedData.fetchedAt).getTime() : Infinity;
            const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

            if (cacheAge < TWO_HOURS_IN_MS) {
                console.log(`Cache for ${cacheCategory} is fresh. Halting network fetch.`);
                setNextPage(null);
                return; // Exit early, we have fresh data
            }
             console.log(`Cache for ${cacheCategory} is stale. Fetching from network (Firestore).`);
        }
    }

    try {
      // Step 3: If cache is stale or non-existent, fetch from Firestore.
      const result = await articleSearch({
        category: cacheCategory,
        language: defaultLanguage,
        country: defaultCountry,
      });
      
      if (result.results.length > 0) {
        setAllCachedArticles(result.results);
        if (!isLoadMore) {
          setArticles(result.results.slice(0, ARTICLES_PER_PAGE));
        }
        setNextPage(null); // Disable API pagination for cached views

        if (result.fetchedAt) {
          await saveArticles(cacheCategory, result.results, result.fetchedAt);
        }
      } else if (allCachedArticles.length === 0) {
        setArticles([]); // No results from network and no cache
      }

    } catch (err) {
      console.error('Failed to fetch articles from Firestore:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news. Please try again later.';
      if (articles.length === 0) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getFilterParams, defaultLanguage, defaultCountry]);

  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilterParams]);


  const handleLoadMore = () => {
    if (nextPage) { // API pagination for live search
      fetchArticles(nextPage);
    } else if (allCachedArticles.length > articles.length) { // Frontend pagination for cache
      setIsLoadingMore(true);
      setTimeout(() => {
        const currentLength = articles.length;
        const newArticles = allCachedArticles.slice(0, currentLength + ARTICLES_PER_PAGE);
        setArticles(newArticles);
        setIsLoadingMore(false);
      }, 300);
    }
  };

  const hasMoreToLoad = nextPage || (allCachedArticles.length > articles.length);

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
            {hasMoreToLoad && (
              <div className="mt-8 flex justify-center">
                <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : !isLoading ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">
                No Articles Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                There are no articles matching your criteria. Please check back later.
              </p>
            </div>
        ) : null }
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
