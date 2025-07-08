import { config } from 'dotenv';
config();

import '@/ai/flows/article-search.ts';
import '@/ai/flows/article-analyzer.ts';
import '@/ai/flows/article-follow-up.ts';
import '@/ai/flows/article-expander.ts';
