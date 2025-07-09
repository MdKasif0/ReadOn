
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

    // For simple category pages, try to load from IndexedDB first for an instant UI update
    const cacheCategory = singleCategory || 'general';
    let hasCache = false;
    if (!isAdvancedSearch) {
      const cachedArticles = await getArticlesByCategory(cacheCategory);
      if (cachedArticles && cachedArticles.length > 0) {
        setArticles(cachedArticles);
        setIsLoading(false); // Stop main loader, show cached content
        hasCache = true;
      }
    }
    
    try {
        const searchInput = {
            query: query || undefined,
            category: isAdvancedSearch ? undefined : (singleCategory || 'general'),
            categories: categoriesArray.length > 0 ? categoriesArray : undefined,
            language: language || defaultLanguage,
            country: country || defaultCountry,
            from: from || undefined,
            to: to || undefined,
        };
      
        const result = await articleSearch(searchInput);

        if (result.results.length > 0) {
            setArticles(result.results);
            // Only cache results for simple, single-category views
            if (!isAdvancedSearch) {
              await saveArticles(cacheCategory, result.results);
            }
        } else if (!hasCache) {
            setError("We couldn't find any articles for your criteria. Please try again with different filters.");
        }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      if (!hasCache) {
        setError('Failed to fetch news articles. Please try again later.');
      }
    } finally {
      if (!hasCache) {
        setIsLoading(false);
      }
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
