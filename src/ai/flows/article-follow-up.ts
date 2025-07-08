'use server';
/**
 * @fileOverview An AI agent for answering follow-up questions about a news article.
 *
 * - followUpOnArticle - A function that answers a user's question about an article.
 * - ArticleFollowUpInput - The input type for the followUpOnArticle function.
 * - ArticleFollowUpOutput - The return type for the followUpOnArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ArticleFollowUpInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  description: z.string().describe('The description or summary of the news article.'),
  question: z.string().describe('The user\'s follow-up question.'),
});
export type ArticleFollowUpInput = z.infer<typeof ArticleFollowUpInputSchema>;

const ArticleFollowUpOutputSchema = z.object({
  answer: z.string().describe('A concise answer to the user\'s question based on the article context.'),
});
export type ArticleFollowUpOutput = z.infer<typeof ArticleFollowUpOutputSchema>;

export async function followUpOnArticle(input: ArticleFollowUpInput): Promise<ArticleFollowUpOutput> {
    return followUpOnArticleFlow(input);
}

const followUpOnArticleFlow = ai.defineFlow(
    {
        name: 'followUpOnArticleFlow',
        inputSchema: ArticleFollowUpInputSchema,
        outputSchema: ArticleFollowUpOutputSchema,
    },
    async (input) => {
        const prompt = `You are a helpful news assistant. Based *only* on the context provided from the news article below, answer the user's question. If the answer cannot be found in the text, say that you don't have enough information to answer.

Article Title: ${input.title}
Article Description: ${input.description}

User's Question: "${input.question}"

Your Answer:`;
        
        const { output } = await ai.generate({
            prompt,
            output: {
                schema: ArticleFollowUpOutputSchema
            },
            config: {
                temperature: 0.5,
            }
        });

        return output!;
    }
);
