
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
import type { Article } from '@/lib/types';


const ArticleSearchInputSchema = z.object({
  query: z.string().optional().describe('The keywords to search for in news articles.'),
  category: z.string().optional().describe('The category for top headlines (used if no query or multi-category).'),
  categories: z.array(z.string()).optional().describe('A list of categories to search for.'),
  country: z.string().optional().describe('The country for top headlines (ISO 3166-1 alpha-2 code).'),
  language: z.string().optional().describe('The language for top headlines (ISO 639-1 code).'),
  page: z.string().optional().describe('The pagination token for the next page of results.'),
});
export type ArticleSearchInput = z.infer<typeof ArticleSearchInputSchema>;

const ArticleSearchOutputSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string().describe('The title of the article.'),
        description: z.string().describe('A brief summary of the article.'),
        content: z.string().describe('The content of the article.'),
        url: z.string().describe('The URL of the article.'),
        imageUrl: z.string().describe('The URL of the article image.'),
        publishedAt: z.string().describe('The date and time the article was published'),
        source: z
          .object({
            name: z.string().describe('The source of the article'),
            url: z.string().describe('The URL of the source'),
          })
          .describe('The source of the article'),
      })
    )
    .describe('The list of articles matching the search keywords.'),
  nextPage: z.string().nullable().describe('The token for the next page of results.'),
  fetchedAt: z.string().optional().describe('The timestamp when the news was fetched from the source.'),
});
export type ArticleSearchOutput = z.infer<typeof ArticleSearchOutputSchema>;

// Helper function to fetch from Newsdata.io API.
async function fetchFromNewsdata(params: {
  query?: string;
  categories?: string[];
  language?: string;
  country?: string;
  page?: string;
}) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    throw new Error('NEWSDATA_API_KEY is not set. Cannot fetch news.');
  }

  // Newsdata.io uses comma-separated values for these parameters
  const country = params.country || 'us';
  const language = params.language || 'en';
  
  const searchParams = new URLSearchParams({
    apikey: apiKey,
    language,
    country,
  });

  if (params.query) searchParams.set('q', params.query);
  if (params.categories && params.categories.length > 0) {
    searchParams.set('category', params.categories.join(','));
  }
  if (params.page) searchParams.set('page', params.page);

  const url = `https://newsdata.io/api/1/news?${searchParams.toString()}`;

  const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache API response for 1 hour

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Newsdata.io API Error:', errorData);
    const errorMessage = errorData.results?.message || response.statusText;
    throw new Error(`Failed to fetch from Newsdata.io: ${errorMessage}`);
  }
  const data = await response.json();
  
  const articles = (data.results || [])
    .map((article: any) => ({
      title: article.title,
      description: article.description || 'No description available.',
      content: article.content || '',
      url: article.link,
      imageUrl: article.image_url || 'https://placehold.co/600x400.png',
      publishedAt: article.pubDate,
      source: {
        name: article.source_id || 'Unknown Source',
        url: article.source_url || '#',
      },
    }))
    .filter((article: any) => article.title && article.url);

  return { results: articles, nextPage: data.nextPage || null };
}


export async function articleSearch(
  input: ArticleSearchInput
): Promise<ArticleSearchOutput> {
  const isSearch = !!input.query || (input.categories && input.categories.length > 0);
  
  // Handle live searches (with query or advanced filters)
  if (isSearch) {
    console.log("Performing live search...");
    const searchResult = await fetchFromNewsdata({
      query: input.query,
      categories: input.categories,
      language: input.language,
      country: input.country,
      page: input.page,
    });
    return searchResult;
  }

  // Handle category browsing from Firestore cache
  const categoryToFetch = input.category || 'top';
  console.log(`Fetching cached news for category: ${categoryToFetch} from Firestore.`);

  if (!db) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const docRef = doc(db, 'news', categoryToFetch);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const articles = (data.articles || []) as Article[];
      console.log(`Found ${articles.length} cached articles for ${categoryToFetch}.`);
      return {
        results: articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
        nextPage: null, // Disable pagination for cached views
        fetchedAt: data.fetchedAt,
      };
    } else {
      console.log(`No cache found for category: ${categoryToFetch}. Performing a live fetch as a fallback.`);
      // No cache exists yet, perform a live fetch to populate it.
      // The cron job will keep it updated later.
      const liveResult = await fetchFromNewsdata({
        categories: [categoryToFetch],
        language: input.language,
        country: input.country,
      });
      // Return a fetchedAt timestamp for the fallback so it can be cached
      return { ...liveResult, fetchedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error(`Error fetching category '${categoryToFetch}' from Firestore:`, error);
    throw new Error(`Could not fetch news for category ${categoryToFetch}.`);
  }
}
