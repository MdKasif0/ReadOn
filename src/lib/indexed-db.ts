import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Article } from '@/lib/types';

const DB_NAME = 'ReadOnDB';
const DB_VERSION = 1;
const ARTICLES_STORE_NAME = 'articles';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

interface NewsCache {
  category: string;
  articles: Article[];
  timestamp: number;
}

interface NewsDB extends DBSchema {
  [ARTICLES_STORE_NAME]: {
    key: string;
    value: NewsCache;
    indexes: { 'by-category': string };
  };
}

let dbPromise: Promise<IDBPDatabase<NewsDB>>;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<NewsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ARTICLES_STORE_NAME)) {
          const store = db.createObjectStore(ARTICLES_STORE_NAME, {
            keyPath: 'category',
          });
          store.createIndex('by-category', 'category');
        }
      },
    });
  }
  return dbPromise;
}

export async function getArticlesByCategory(category: string): Promise<Article[] | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const db = await getDb();
    const cachedData = await db.get(ARTICLES_STORE_NAME, category);

    if (cachedData) {
      const isStale = Date.now() - cachedData.timestamp > CACHE_DURATION;
      if (!isStale) {
        console.log(`Serving articles for '${category}' from IndexedDB.`);
        return cachedData.articles;
      } else {
        console.log(`IndexedDB cache for '${category}' is stale.`);
      }
    }
  } catch (error) {
    console.error('Failed to get articles from IndexedDB:', error);
  }
  return null;
}

export async function saveArticles(category: string, articles: Article[]): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDb();
    const cacheEntry: NewsCache = {
      category,
      articles,
      timestamp: Date.now(),
    };
    await db.put(ARTICLES_STORE_NAME, cacheEntry);
    console.log(`Saved articles for '${category}' to IndexedDB.`);
  } catch (error) {
    console.error('Failed to save articles to IndexedDB:', error);
  }
}
