import type { ArticleSearchOutput } from '@/ai/flows/article-search';

export type Article = ArticleSearchOutput['results'][number];

export type Bookmark = {
    article: Article;
    notes: string;
    tags: string[];
    addedAt: number;
};
