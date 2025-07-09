'use server';

/**
 * @fileOverview A news article search AI agent.
 *
 * - articleSearch - A function that handles the article search process.
 * - ArticleSearchInput - The input type for the articleSearch function.
 * - ArticleSearchOutput - The return type for the articleSearch function.
 */

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ArticleSearchInputSchema = z.object({
  query: z.string().optional().describe('The keywords to search for in news articles.'),
  category: z.string().optional().describe('The category for top headlines (used if no query or multi-category).'),
  categories: z.array(z.string()).optional().describe('A list of categories to search for.'),
  country: z.string().optional().describe('The country for top headlines (ISO 3166-1 alpha-2 code).'),
  language: z.string().optional().describe('The language for top headlines (ISO 639-1 code).'),
  from: z.string().optional().describe('The start date for the search (ISO 8601 format).'),
  to: z.string().optional().describe('The end date for the search (ISO 8601 format).'),
});
export type ArticleSearchInput = z.infer<typeof ArticleSearchInputSchema>;

const ArticleSearchOutputSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string().describe('The title of the article.'),
        description: z.string().describe('A brief summary of the article.'),
        content: z.string().describe('The content of the article.'),
        url: z.string().url().describe('The URL of the article.'),
        imageUrl: z.string().url().describe('The URL of the article image.'),
        publishedAt: z
          .string()
          .describe('The date and time the article was published'),
        source: z
          .object({
            name: z.string().describe('The source of the article'),
            url: z.string().url().describe('The URL of the source'),
          })
          .describe('The source of the article'),
      })
    )
    .describe('The list of articles matching the search keywords.'),
});
export type ArticleSearchOutput = z.infer<typeof ArticleSearchOutputSchema>;

// Helper function to fetch from GNews API to avoid code repetition.
async function fetchFromGNews(params: {
  query?: string;
  category?: string;
  language?: string;
  country?: string;
  from?: string;
  to?: string;
}) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error('GNEWS_API_KEY is not set. Returning empty results.');
    return [];
  }

  const lang = params.language || 'en';
  const country = params.country || 'us';
  const max = 10;
  let url = `https://gnews.io/api/v4/`;

  if (params.query) {
    let searchQuery = `search?q=${encodeURIComponent(
      params.query
    )}&lang=${lang}&country=${country}&max=${max}`;
    if (params.from) searchQuery += `&from=${params.from}`;
    if (params.to) searchQuery += `&to=${params.to}`;
    url += `${searchQuery}&apikey=${apiKey}`;
  } else if (params.category) {
    url += `top-headlines?category=${params.category}&lang=${lang}&country=${country}&max=${max}&apikey=${apiKey}`;
  } else {
    return [];
  }

  try {
    // Use a short revalidation time for live fetches to keep content fresh but avoid excessive API calls on re-renders.
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache API response for 1 hour
    if (!response.ok) {
      const errorData = await response.json();
      console.error('GNews API Error:', errorData);
      return [];
    }
    const data = await response.json();

    const articles = data.articles
      .map((article: any) => ({
        title: article.title,
        description: article.description || 'No description available.',
        content: (article.content || '').replace(/\s*\[\+\d+\s*characters\]\s*$/, '').trim(),
        url: article.url,
        imageUrl: article.image || 'https://placehold.co/600x400.png',
        publishedAt: article.publishedAt,
        source: {
          name: article.source.name,
          url: article.source.url,
        },
      }))
      .filter((article: any) => article.title !== '[Removed]');

    return articles;
  } catch (error) {
    console.error('Failed to fetch articles from GNews:', error);
    return [];
  }
}

export async function articleSearch(
  input: ArticleSearchInput
): Promise<ArticleSearchOutput> {
  // A search is triggered by a query, multiple categories, or a date range.
  // These operations always hit the live API and bypass the cache.
  let effectiveQuery = input.query;
  if (input.categories && input.categories.length > 0) {
    const categoryQuery = input.categories.map(c => `"${c}"`).join(' OR ');
    effectiveQuery = effectiveQuery ? `${effectiveQuery} AND (${categoryQuery})` : categoryQuery;
  }
  
  const isSearchOperation = !!effectiveQuery || !!input.from;

  if (isSearchOperation) {
    const articles = await fetchFromGNews({
      query: effectiveQuery || 'news', // GNews requires a query for search, use a generic term if only dates are provided
      language: input.language,
      country: input.country,
      from: input.from,
      to: input.to,
    });
    return { results: articles };
  }

  // For single-category headlines (from sidebar), first try the Firestore cache.
  const category = input.category || 'general';
  if (db) {
    try {
      const docRef = doc(db, 'news', category);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().articles?.length > 0) {
        console.log(`Serving articles for '${category}' from cache.`);
        const data = docSnap.data();
        return { results: data.articles || [] };
      }
    } catch (error) {
      console.error(
        'Failed to fetch from Firestore, falling back to API:',
        error
      );
    }
  } else {
    console.warn('Firestore is not initialized. Falling back to live API.');
  }

  // Fallback: If cache is empty, doesn't exist, or Firestore fails, fetch live from GNews.
  // This ensures the app shows content on first load before the cron job runs.
  console.log(
    `Cache empty or unavailable for '${
      input.category || 'general'
    }'. Fetching live from GNews.`
  );
  const articles = await fetchFromGNews({
    category: input.category || 'general',
    language: input.language,
    country: input.country,
  });
  return { results: articles };
}
