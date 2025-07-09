
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { articleSearch } from '@/ai/flows/article-search';
import type { Article } from '@/lib/types';
import { ArticleGrid } from '@/components/article-grid';
import { ArticleSkeleton } from '@/components/article-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { newsCategories } from '@/lib/categories';
import { useSettings } from '@/providers/settings-provider';
import { getArticlesByCategory, saveArticles } from '@/lib/indexed-db';

function NewsFeed() {
  const searchParams = useSearchParams();
  const { language: defaultLanguage, country: defaultCountry } = useSettings();

  // Extract all possible filter params from URL
  const query = searchParams.get('q');
  const singleCategory = searchParams.get('category');
  const multiCategories = searchParams.get('categories');
  const country = searchParams.get('country');
  const language = searchParams.get('language');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('For You');
  
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const categoriesArray = multiCategories ? multiCategories.split(',') : [];
    const isAdvancedSearch = !!query || categoriesArray.length > 0 || !!from;

    // Set page title based on filters
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

    const cacheCategory = singleCategory || 'general';
    let hasDisplayedCachedArticles = false;

    // For simple category pages, try to load from IndexedDB first for an instant UI update
    if (!isAdvancedSearch) {
      const cachedArticles = await getArticlesByCategory(cacheCategory);
      if (cachedArticles && cachedArticles.length > 0) {
        setArticles(cachedArticles);
        setIsLoading(false); // Stop full-page loading once cached data is shown.
        hasDisplayedCachedArticles = true;
      }
    }
    
    try {
        const searchInput = {
            query: query || undefined,
            category: isAdvancedSearch ? undefined : (singleCategory || 'general'),
            categories: multiCategories ? multiCategories.split(',') : undefined,
            language: language || defaultLanguage,
            country: country || defaultCountry,
            from: from || undefined,
            to: to || undefined,
        };
      
        const result = await articleSearch(searchInput);

        if (isAdvancedSearch) {
            setArticles(result.results);
        } else {
            // For category views, save the latest articles to IndexedDB...
            await saveArticles(cacheCategory, result.results);
            // ...then reload the entire category from the DB to show the merged list.
            const allCachedArticles = await getArticlesByCategory(cacheCategory);
            if (allCachedArticles) {
                setArticles(allCachedArticles);
            } else {
                // As a fallback, just show the latest fetched articles.
                setArticles(result.results);
            }
        }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      // If the fetch fails, only show an error if we have nothing from the cache to display.
      // This prevents a jarring error message from appearing over stale-but-usable content.
      if (!hasDisplayedCachedArticles) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news articles. Please try again later.';
        setError(errorMessage);
      }
    } finally {
      // Always ensure the loading state is turned off after the network request.
      setIsLoading(false);
    }
  }, [searchParams, defaultCountry, defaultLanguage, from, multiCategories, query, singleCategory, to]);

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
        
        {isLoading ? (
          <ArticleGrid>
            {Array.from({ length: 9 }).map((_, i) => (
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
          <ArticleGrid articles={articles} />
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
