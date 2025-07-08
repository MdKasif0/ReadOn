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
  category: z.string().optional().describe('The category for top headlines.'),
  country: z.string().optional().describe('The country for top headlines (ISO 3166-1 alpha-2 code).'),
  language: z.string().optional().describe('The language for top headlines (ISO 639-1 code).'),
});
export type ArticleSearchInput = z.infer<typeof ArticleSearchInputSchema>;

const ArticleSearchOutputSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string().describe('The title of the article.'),
        description: z.string().describe('A brief summary of the article.'),
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

export async function articleSearch(
  input: ArticleSearchInput
): Promise<ArticleSearchOutput> {
  // For search queries, we hit the GNews API in real-time.
  if (input.query) {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      console.error('GNEWS_API_KEY is not set. Returning empty results.');
      return { results: [] };
    }
    const language = input.language || 'en';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      input.query
    )}&lang=${language}&max=10&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
      if (!response.ok) {
        const errorData = await response.json();
        console.error('GNews API Error:', errorData);
        // Don't throw, just return empty so the app doesn't crash
        return { results: [] };
      }
      const data = await response.json();
  
      const articles = data.articles
        .map((article: any) => ({
          title: article.title,
          description: article.description || 'No description available.',
          url: article.url,
          imageUrl: article.image || 'https://placehold.co/600x400.png',
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            url: article.source.url,
          },
        }))
        .filter((article: any) => article.title !== '[Removed]');
  
      return { results: articles };
    } catch (error) {
      console.error('Failed to fetch articles from GNews:', error);
      return { results: [] };
    }
  } else {
    // For top headlines by category, we fetch from our Firestore cache.
    // The country and language settings do not apply here, as we use a shared cache
    // populated by the backend script.
    try {
      const category = input.category || 'general';
      const docRef = doc(db, 'news', category);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const articles = data.articles || [];
        return { results: articles };
      } else {
        console.warn(`No cached articles found for category: ${category}. You may need to run the cron job at /api/cron/fetch-news.`);
        return { results: [] };
      }
    } catch (error) {
      console.error('Failed to fetch articles from Firestore:', error);
      return { results: [] };
    }
  }
}
