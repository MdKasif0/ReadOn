'use server';
/**
 * @fileOverview An AI agent for analyzing news articles.
 *
 * - analyzeArticle - A function that generates related topics for an article.
 * - ArticleAnalysisInput - The input type for the analyzeArticle function.
 * - ArticleAnalysisOutput - The return type for the analyzeArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ArticleAnalysisInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  description: z.string().describe('The description or summary of the news article.'),
});
export type ArticleAnalysisInput = z.infer<typeof ArticleAnalysisInputSchema>;

export const ArticleAnalysisOutputSchema = z.object({
  relatedTopics: z.array(z.string()).describe('A list of 2-4 short, relevant topic tags for the article.'),
});
export type ArticleAnalysisOutput = z.infer<typeof ArticleAnalysisOutputSchema>;

export async function analyzeArticle(input: ArticleAnalysisInput): Promise<ArticleAnalysisOutput> {
  return analyzeArticleFlow(input);
}

const analyzeArticleFlow = ai.defineFlow(
  {
    name: 'analyzeArticleFlow',
    inputSchema: ArticleAnalysisInputSchema,
    outputSchema: ArticleAnalysisOutputSchema,
  },
  async (input) => {
    const prompt = `Based on the following news article title and description, generate a list of 2-4 short, relevant topic tags. These tags should be concise and suitable for use as filter buttons.

Title: ${input.title}
Description: ${input.description}

Return ONLY the list of topics in the specified JSON format.`;

    const { output } = await ai.generate({
      prompt: prompt,
      output: {
          schema: ArticleAnalysisOutputSchema
      },
      config: {
          temperature: 0.3,
      }
    });
    return output!;
  }
);
