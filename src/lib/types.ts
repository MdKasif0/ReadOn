import type { ArticleSearchOutput } from '@/ai/flows/article-search';

export type Article = ArticleSearchOutput['results'][number];
