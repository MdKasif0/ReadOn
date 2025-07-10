
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { articleSearch } from '@/ai/flows/article-search';
import type { Article } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Loader2, Grip } from 'lucide-react';
import { newsCategories } from '@/lib/categories';
import { useSettings } from '@/providers/settings-provider';
import { getArticlesByCategory, saveArticles } from '@/lib/indexed-db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { NewsStoryCard } from '@/components/news-story-card';

const INTERESTS_STORAGE_KEY = 'readon-interests';

const cardColors = [
    "#FEF5D9", "#FCEAF1", "#E6F4F1", "#F0EAF9", "#DDEEFE", "#FFF8E1"
];

function NewsFeed() {
  const searchParams = useSearchParams();
  const { language: defaultLanguage, country: defaultCountry } = useSettings();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedCategories, setDisplayedCategories] = useState<typeof newsCategories>([]);
  const [isInterestsLoaded, setIsInterestsLoaded] = useState(false);
  const [articleColors, setArticleColors] = useState<string[]>([]);

  // For frontend-based pagination from cache
  const [allCachedArticles, setAllCachedArticles] = useState<Article[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(INTERESTS_STORAGE_KEY);
      let selectedSlugs: string[];
      if (storedData) {
        selectedSlugs = JSON.parse(storedData);
      } else {
        // Default interests if nothing is stored
        selectedSlugs = ['health', 'technology', 'sports', 'politics'];
      }
      const filteredCategories = newsCategories.filter(c => selectedSlugs.includes(c.slug));
      setDisplayedCategories(filteredCategories);
    } catch (error) {
        console.error('Failed to load interests from localStorage', error);
        // Fallback to a default set of categories
        setDisplayedCategories(newsCategories.filter(c => c.slug !== 'top' && c.slug !== 'general' && c.slug !== 'world' && c.slug !== 'nation'));
    }
    setIsInterestsLoaded(true);
  }, []);

  const getFilterParams = useCallback(() => {
    let singleCategory = searchParams.get('category');
    // If no category is in the URL and we have loaded interests, default to the first one.
    if (!singleCategory && isInterestsLoaded && displayedCategories.length > 0) {
        singleCategory = displayedCategories[0].slug;
    } else if (!singleCategory) {
        singleCategory = 'top'; // Fallback if interests haven't loaded yet
    }

    return {
      query: searchParams.get('q'),
      singleCategory: singleCategory,
      multiCategories: searchParams.get('categories'),
      country: searchParams.get('country'),
      language: searchParams.get('language'),
    };
  }, [searchParams, isInterestsLoaded, displayedCategories]);

  const activeCategory = getFilterParams().singleCategory;

  const assignColorsToArticles = (articles: Article[]) => {
    const colors = articles.map(() => cardColors[Math.floor(Math.random() * cardColors.length)]);
    setArticleColors(colors);
  };

  const fetchArticles = useCallback(async () => {
    if (!isInterestsLoaded) return; // Don't fetch until we know the interests

    setIsLoading(true);
    setError(null);
    setAllCachedArticles([]);
    setArticles([]);

    const { query, singleCategory, multiCategories, country, language } = getFilterParams();
    const categoriesArray = multiCategories ? multiCategories.split(',') : [];
    const isSearch = !!query || categoriesArray.length > 0;
    
    // Branch for live searches (query or multi-category)
    if (isSearch) {
        try {
            const result = await articleSearch({
                query: query || undefined,
                categories: categoriesArray.length > 0 ? categoriesArray : undefined,
                language: language || defaultLanguage,
                country: country || defaultCountry,
            });
            setArticles(result.results);
            assignColorsToArticles(result.results);
        } catch(err) {
            console.error('Failed to fetch live search articles:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news. Please try again later.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
        return;
    }
    
    // Branch for single category browsing (offline-first)
    const cacheCategory = singleCategory || 'top';
    
    const cachedData = await getArticlesByCategory(cacheCategory);
    if (cachedData && cachedData.articles.length > 0) {
        setAllCachedArticles(cachedData.articles);
        setArticles(cachedData.articles);
        assignColorsToArticles(cachedData.articles);
        setIsLoading(false);

        const cacheAge = cachedData.fetchedAt ? Date.now() - new Date(cachedData.fetchedAt).getTime() : Infinity;
        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

        if (cacheAge < TWO_HOURS_IN_MS) {
            console.log(`Cache for ${cacheCategory} is fresh. Halting network fetch.`);
            return;
        }
         console.log(`Cache for ${cacheCategory} is stale. Fetching from network (Firestore).`);
    }

    try {
      const result = await articleSearch({
        category: cacheCategory,
        language: defaultLanguage,
        country: defaultCountry,
      });
      
      if (result.results.length > 0) {
        setAllCachedArticles(result.results);
        setArticles(result.results);
        assignColorsToArticles(result.results);
        if (result.fetchedAt) {
          await saveArticles(cacheCategory, result.results, result.fetchedAt);
        }
      } else if (allCachedArticles.length === 0) {
        setArticles([]);
      }

    } catch (err) {
      console.error('Failed to fetch articles from Firestore:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news. Please try again later.';
      if (articles.length === 0) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getFilterParams, defaultLanguage, defaultCountry, articles.length, allCachedArticles.length, isInterestsLoaded]);

  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilterParams, isInterestsLoaded]);


  const renderContent = () => {
    if (isLoading || !isInterestsLoaded) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching News</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (articles.length > 0) {
        return (
            <Carousel className="w-full" opts={{ align: "center", loop: false }}>
                <CarouselContent className="-ml-2">
                    {articles.map((article, index) => (
                        <CarouselItem key={article.url} className="pl-4 basis-[90%] md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <NewsStoryCard article={article} color={articleColors[index]} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        );
    }

    return (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-black/50 p-12 text-center text-white">
          <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground">
            No Articles Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            There are no articles matching your criteria.
          </p>
        </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-hidden">
        <header className="p-4 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">ReadOn</h1>
                 <Button asChild variant="ghost" size="icon" className="rounded-full">
                    <Link href="/interests">
                        <Grip className="h-6 w-6" />
                    </Link>
                </Button>
            </div>
            <div className="mt-4 overflow-x-auto whitespace-nowrap pb-2">
                <nav className="flex items-center space-x-4">
                    {displayedCategories.map(category => (
                         <Link key={category.slug} href={`/feed?category=${category.slug}`} className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                            activeCategory === category.slug ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        )}>
                            {category.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
            {renderContent()}
        </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    // The Suspense boundary is kept in case of slow initial param reading
    <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
    }>
      <NewsFeed />
    </Suspense>
  );
}
