
'use client';

import { useState } from 'react';
import { articleSearch } from '@/ai/flows/article-search';
import type { Article } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2, Search, X, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArticleGrid } from '@/components/article-grid';
import { ArticleSkeleton } from '@/components/article-skeleton';
import { useSettings } from '@/providers/settings-provider';
import { saveArticles } from '@/lib/indexed-db';

const suggestedTopics = [
  'Artificial Intelligence',
  'Climate Change',
  'US Elections',
  'Global Economy',
  'Space Exploration',
  'Movie Premieres',
];

export default function SearchPage() {
  const { language, country } = useSettings();
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setArticles([]);

    try {
      const result = await articleSearch({
        query: searchQuery,
        language,
        country,
      });
      setArticles(result.results);
      // Cache the search results so they can be opened in the article detail view.
      // We use the query as a temporary "category" for caching.
      if (result.results.length > 0) {
        await saveArticles(searchQuery, result.results, new Date().toISOString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (topic: string) => {
    setQuery(topic);
    handleSearch(topic);
  }

  const handleClear = () => {
    setQuery('');
    setArticles([]);
    setHasSearched(false);
    setError(null);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <ArticleGrid>
            {Array.from({ length: 6 }).map((_, index) => (
                <ArticleSkeleton key={index} />
            ))}
        </ArticleGrid>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Search Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (hasSearched && articles.length === 0) {
        return (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-12 text-center">
              <Info className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold">
                No Articles Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                Try searching for something else.
              </p>
            </div>
          );
    }

    if (articles.length > 0) {
      return <ArticleGrid articles={articles} displayMode="search" />;
    }
    
    // Initial state: show suggestions
    return (
        <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Or try one of these topics</h2>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestedTopics.map(topic => (
                    <Button key={topic} variant="outline" size="sm" onClick={() => handleSuggestionClick(topic)}>
                        {topic}
                    </Button>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 bg-background/80 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                Search
            </h1>
            <form onSubmit={handleSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for articles, topics, or sources..."
                    className="h-12 rounded-full border-2 bg-muted pl-10 pr-10 text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                        onClick={handleClear}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </form>
       </div>
       <div className="mt-6">
            {renderContent()}
       </div>
    </div>
  );
}
