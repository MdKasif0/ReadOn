'use server';

/**
 * @fileOverview A news article search AI agent.
 *
 * - articleSearch - A function that handles the article search process.
 * - ArticleSearchInput - The input type for the articleSearch function.
 * - ArticleSearchOutput - The return type for the articleSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArticleSearchInputSchema = z.object({
  keywords: z
    .string()
    .describe('The keywords to search for in news articles.'),
});
export type ArticleSearchInput = z.infer<typeof ArticleSearchInputSchema>;

const ArticleSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string().describe('The title of the article.'),
      description: z.string().describe('A brief summary of the article.'),
      url: z.string().url().describe('The URL of the article.'),
      imageUrl: z.string().url().describe('The URL of the article image.'),
      publishedAt: z.string().describe('The date and time the article was published'),
      source: z.object({
        name: z.string().describe('The source of the article'),
        url: z.string().url().describe('The URL of the source'),
      }).describe('The source of the article'),
    })
  ).describe('The list of articles matching the search keywords.'),
});
export type ArticleSearchOutput = z.infer<typeof ArticleSearchOutputSchema>;

export async function articleSearch(input: ArticleSearchInput): Promise<ArticleSearchOutput> {
  return articleSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'articleSearchPrompt',
  input: {schema: ArticleSearchInputSchema},
  output: {schema: ArticleSearchOutputSchema},
  prompt: `You are a helpful assistant that retrieves news articles based on user keywords.

  Instructions:
  1. Use the provided keywords to search for relevant news articles.
  2. Return the results in a JSON format that includes the title, description, URL and imageUrl.

  Keywords: {{{keywords}}}`, 
});

const articleSearchFlow = ai.defineFlow(
  {
    name: 'articleSearchFlow',
    inputSchema: ArticleSearchInputSchema,
    outputSchema: ArticleSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
