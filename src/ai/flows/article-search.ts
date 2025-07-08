'use server';

/**
 * @fileOverview A news article search AI agent.
 *
 * - articleSearch - A function that handles the article search process.
 * - ArticleSearchInput - The input type for the articleSearch function.
 * - ArticleSearchOutput - The return type for the articleSearch function.
 */

import { z } from 'zod';

const ArticleSearchInputSchema = z.object({
  keywords: z.string().describe('The keywords to search for in news articles.'),
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
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error('GNEWS_API_KEY is not set. Returning empty results.');
    return { results: [] };
  }

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    input.keywords
  )}&lang=en&max=9&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      const errorData = await response.json();
      console.error('GNews API Error:', errorData);
       // Don't throw, just return empty so the app doesn't crash
      return { results: [] };
    }
    const data = await response.json();

    const articles = data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || 'No description available.',
      url: article.url,
      imageUrl: article.image || 'https://placehold.co/600x400.png',
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url,
      },
    })).filter((article: any) => article.title !== '[Removed]');

    return { results: articles };
  } catch (error) {
    console.error('Failed to fetch articles from GNews:', error);
    return { results: [] };
  }
}
