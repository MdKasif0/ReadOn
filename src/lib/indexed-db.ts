import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Article } from '@/lib/types';

const DB_NAME = 'ReadOnDB';
const DB_VERSION = 2; // Incremented DB version for schema change
const ARTICLES_STORE_NAME = 'articles';
const EXPIRATION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface ArticleCacheEntry {
  url: string; // This will be the key
  article: Article;
  category: string;
  timestamp: number;
}

interface NewsDB extends DBSchema {
  [ARTICLES_STORE_NAME]: {
    key: string; // article.url
    value: ArticleCacheEntry;
    indexes: { 'by-category': string; 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<NewsDB>>;

function getDb() {
  if (typeof window === 'undefined') {
    // Return a dummy promise that never resolves for server-side rendering
    return new Promise<IDBPDatabase<NewsDB>>(() => {});
  }
  if (!dbPromise) {
    dbPromise = openDB<NewsDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2) {
          // If the old store exists from v1, delete it to migrate to the new structure.
          if (db.objectStoreNames.contains(ARTICLES_STORE_NAME)) {
            db.deleteObjectStore(ARTICLES_STORE_NAME);
          }
          // Create the new store with the updated schema.
          const store = db.createObjectStore(ARTICLES_STORE_NAME, {
            keyPath: 'url',
          });
          store.createIndex('by-category', 'category');
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

export async function cleanupExpiredArticles(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await getDb();
    const tx = db.transaction(ARTICLES_STORE_NAME, 'readwrite');
    const index = tx.store.index('by-timestamp');
    const oneMonthAgo = Date.now() - EXPIRATION_DURATION;
    
    let cursor = await index.openCursor(IDBKeyRange.upperBound(oneMonthAgo));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  } catch (error) {
    console.error('Failed to clean up expired articles:', error);
  }
}

export async function getArticlesByCategory(category: string): Promise<Article[] | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const db = await getDb();
    // Efficiently clean up expired articles before fetching.
    await cleanupExpiredArticles();

    const articles = await db.getAllFromIndex(ARTICLES_STORE_NAME, 'by-category', category);
    
    if (articles && articles.length > 0) {
      console.log(`Serving ${articles.length} articles for '${category}' from IndexedDB.`);
      // Sort by published date to ensure newest are first.
      return articles.map(entry => entry.article).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
  } catch (error) {
    console.error('Failed to get articles from IndexedDB:', error);
  }
  return null;
}

export async function getArticleByUrl(url: string): Promise<Article | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await getDb();
    const entry = await db.get(ARTICLES_STORE_NAME, url);
    if (entry) {
      console.log(`Serving article with URL '${url}' from IndexedDB.`);
      return entry.article;
    }
  } catch (error) {
    console.error(`Failed to get article with URL '${url}' from IndexedDB:`, error);
  }
  return null;
}

export async function saveArticles(category: string, articles: Article[]): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDb();
    const tx = db.transaction(ARTICLES_STORE_NAME, 'readwrite');
    
    // Use Promise.all for an efficient batch operation.
    // The put() method will automatically insert new articles or update existing ones.
    await Promise.all(articles.map(article => {
      const entry: ArticleCacheEntry = {
        url: article.url,
        article,
        category,
        timestamp: Date.now(),
      };
      return tx.store.put(entry);
    }));

    await tx.done;
    console.log(`Saved/updated ${articles.length} articles for '${category}' to IndexedDB.`);
  } catch (error) {
    console.error('Failed to save articles to IndexedDB:', error);
  }
}
