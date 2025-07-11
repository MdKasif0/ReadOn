
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { newsCategories } from '@/lib/categories';
import { Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const INTERESTS_STORAGE_KEY = 'readon-interests';

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(INTERESTS_STORAGE_KEY);
      if (storedData) {
        setSelectedInterests(new Set(JSON.parse(storedData)));
      } else {
        // Default interests if nothing is stored
        const defaultInterests = ['domestic', 'technology', 'sports', 'politics'];
        setSelectedInterests(new Set(defaultInterests));
      }
    } catch (error) {
      console.error('Failed to load interests from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const handleToggleInterest = (slug: string) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };
  
  const handleSubmit = () => {
    try {
      const interestsArray = Array.from(selectedInterests);
      localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(interestsArray));
    } catch (error) {
      console.error("Failed to save interests", error);
    }
    router.push('/feed');
  };

  const categoriesToShow = newsCategories.filter(c => c.slug !== 'top' && c.slug !== 'world' && c.slug !== 'other');

  if (!isLoaded) {
    return <div className="h-screen w-full bg-background" />;
  }

  return (
    <div className="flex h-screen flex-col bg-background p-6">
      <header className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="ml-4 text-3xl font-bold">Select Interests</h1>
      </header>

      <main className="mt-8 flex-1 space-y-4 overflow-y-auto">
        {categoriesToShow.map(category => {
          const isSelected = selectedInterests.has(category.slug);
          return (
            <div
              key={category.slug}
              onClick={() => handleToggleInterest(category.slug)}
              className="flex cursor-pointer items-center justify-between rounded-full bg-card p-2 pr-6 shadow-sm border"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'border-2 border-border bg-card'
                  )}
                >
                  {isSelected && <Check className="h-6 w-6" />}
                </div>
                <span className="text-lg font-medium">{category.name}</span>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="mt-auto pt-4">
        <Button
          onClick={handleSubmit}
          className="h-14 w-full rounded-full bg-primary text-primary-foreground text-lg font-bold"
        >
          Submit
        </Button>
      </footer>
    </div>
  );
}
