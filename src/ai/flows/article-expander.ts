'use server';
/**
 * @fileOverview An AI agent for expanding news articles.
 *
 * - expandArticle - A function that generates a more detailed article from a summary.
 * - ArticleExpanderInput - The input type for the expandArticle function.
 * - ArticleExpanderOutput - The return type for the expandArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ArticleExpanderInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  description: z.string().describe('The description or summary of the news article.'),
});
export type ArticleExpanderInput = z.infer<typeof ArticleExpanderInputSchema>;

const ArticleExpanderOutputSchema = z.object({
  expandedContent: z.string().describe('The full, detailed content of the news article, written in a journalistic style with multiple paragraphs.'),
});
export type ArticleExpanderOutput = z.infer<typeof ArticleExpanderOutputSchema>;

export async function expandArticle(input: ArticleExpanderInput): Promise<ArticleExpanderOutput> {
  return expandArticleFlow(input);
}

const expandArticleFlow = ai.defineFlow(
  {
    name: 'expandArticleFlow',
    inputSchema: ArticleExpanderInputSchema,
    outputSchema: ArticleExpanderOutputSchema,
  },
  async (input) => {
    const prompt = `You are a professional journalist. Based on the provided news article title and summary, please write a comprehensive, well-structured news article of 3-4 paragraphs. The article should be factual, neutral, and engaging for the reader. Make sure to format the output into distinct paragraphs.

Article Title: "${input.title}"
Article Summary: "${input.description}"

Return ONLY the expanded article content in the specified JSON format.`;

    const { output } = await ai.generate({
      prompt: prompt,
      output: {
          schema: ArticleExpanderOutputSchema
      },
      config: {
          temperature: 0.6,
      }
    });
    return output!;
  }
);
