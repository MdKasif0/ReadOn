'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { newsCategories } from '@/lib/categories';
import { supportedCountries } from '@/lib/countries';
import { supportedLanguages } from '@/lib/languages';
import { useSettings } from '@/providers/settings-provider';

export function FilterSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { country: defaultCountry, language: defaultLanguage } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    // Initialize state from URL search params when component mounts or params change
    if (isOpen) {
        const categories = searchParams.get('categories')?.split(',') || [];
        const country = searchParams.get('country') || defaultCountry;
        const language = searchParams.get('language') || defaultLanguage;
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        setSelectedCategories(categories.filter(Boolean));
        setSelectedCountry(country);
        setSelectedLanguage(language);
        
        if (from) {
            const range: DateRange = { from: new Date(from) };
            if (to) {
                range.to = new Date(to);
            }
            setDateRange(range);
        } else {
            setDateRange(undefined);
        }
    }
  }, [searchParams, defaultCountry, defaultLanguage, isOpen]);
  
  const handleCategoryChange = (slug: string, checked: boolean | string) => {
    setSelectedCategories(prev =>
      checked ? [...prev, slug] : prev.filter(c => c !== slug)
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
    } else {
        params.delete('categories');
    }
    
    if (selectedCountry) {
        params.set('country', selectedCountry);
    } else {
        params.delete('country');
    }
    
    if (selectedLanguage) {
        params.set('language', selectedLanguage);
    } else {
        params.delete('language');
    }

    if (dateRange?.from) {
        params.set('from', dateRange.from.toISOString());
        if (dateRange.to) {
            params.set('to', dateRange.to.toISOString());
        } else {
            params.delete('to');
        }
    } else {
        params.delete('from');
        params.delete('to');
    }

    // Using advanced filters clears the single category from the sidebar
    params.delete('category');
    
    router.push(`/feed?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    router.push('/feed');
    setIsOpen(false);
  };

  const generalCategory = newsCategories.find(c => c.slug === 'general');
  const otherCategories = newsCategories.filter(c => c.slug !== 'general');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Open Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-1 pr-4">
            {/* Country and Language Selectors */}
            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Region</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="country-select">Country</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger id="country-select">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {supportedCountries.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="language-select">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger id="language-select">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {supportedLanguages.map((l) => (
                                    <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Date Range</h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !dateRange && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                                        {format(dateRange.to, 'LLL dd, y')}
                                    </>
                                ) : (
                                    format(dateRange.from, 'LLL dd, y')
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                        />
                    </PopoverContent>
                </Popover>
            </div>
          
            {/* Topic/Category Selector */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Topics</h3>
              <p className="text-sm text-muted-foreground">
                  Selecting topics will perform a live search.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[generalCategory, ...otherCategories].filter(Boolean).map(category => (
                  <div key={category!.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category!.slug}`}
                      checked={selectedCategories.includes(category!.slug)}
                      onCheckedChange={(checked) => handleCategoryChange(category!.slug, checked)}
                    />
                    <Label htmlFor={`category-${category!.slug}`} className="font-normal">
                      {category!.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
        </div>
        <SheetFooter className="mt-auto border-t pt-4">
            <Button variant="ghost" onClick={handleClearFilters}>Clear</Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
