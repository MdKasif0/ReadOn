
import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Article } from '@/lib/types';

const DB_NAME = 'ReadOnDB';
const DB_VERSION = 3; // Incremented DB version for schema change
const ARTICLES_STORE_NAME = 'articles';
const CACHE_METADATA_STORE_NAME = 'cacheMetadata';
const EXPIRATION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface ArticleCacheEntry {
  url: string; // This will be the key
  article: Article;
  category: string;
  timestamp: number;
}

interface NewsDBCacheMetadata {
  category: string;
  fetchedAt: string;
}

interface NewsDB extends DBSchema {
  [ARTICLES_STORE_NAME]: {
    key: string; // article.url
    value: ArticleCacheEntry;
    indexes: { 'by-category': string; 'by-timestamp': number };
  };
  [CACHE_METADATA_STORE_NAME]: {
    key: string; // category slug
    value: NewsDBCacheMetadata;
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
          if (db.objectStoreNames.contains(ARTICLES_STORE_NAME)) {
            db.deleteObjectStore(ARTICLES_STORE_NAME);
          }
          const store = db.createObjectStore(ARTICLES_STORE_NAME, {
            keyPath: 'url',
          });
          store.createIndex('by-category', 'category');
          store.createIndex('by-timestamp', 'timestamp');
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains(CACHE_METADATA_STORE_NAME)) {
            db.createObjectStore(CACHE_METADATA_STORE_NAME, { keyPath: 'category' });
          }
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
    const thirtyDaysAgo = Date.now() - EXPIRATION_DURATION;
    
    let cursor = await index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
    console.log('Successfully cleaned up expired articles from IndexedDB.');
  } catch (error) {
    console.error('Failed to clean up expired articles:', error);
  }
}

export async function getArticlesByCategory(category: string): Promise<{ articles: Article[]; fetchedAt: string | null } | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const db = await getDb();
    await cleanupExpiredArticles();

    const articles = await db.getAllFromIndex(ARTICLES_STORE_NAME, 'by-category', category);
    const metadata = await db.get(CACHE_METADATA_STORE_NAME, category);
    
    if (articles && articles.length > 0) {
      console.log(`Serving ${articles.length} articles for '${category}' from IndexedDB.`);
      return {
          articles: articles.map(entry => entry.article).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
          fetchedAt: metadata?.fetchedAt || null,
      };
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

export async function saveArticles(category: string, articles: Article[], fetchedAt: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDb();
    const tx = db.transaction([ARTICLES_STORE_NAME, CACHE_METADATA_STORE_NAME], 'readwrite');
    const articleStore = tx.objectStore(ARTICLES_STORE_NAME);
    const metadataStore = tx.objectStore(CACHE_METADATA_STORE_NAME);
    
    // Use a Map to ensure articles are unique by URL before saving
    const articleMap = new Map<string, Article>();
    articles.forEach(article => articleMap.set(article.url, article));

    const uniqueArticles = Array.from(articleMap.values());

    const articlePromises = uniqueArticles.map(article => {
      const entry: ArticleCacheEntry = {
        url: article.url,
        article,
        category,
        timestamp: Date.now(),
      };
      return articleStore.put(entry);
    });

    const metadataPromise = metadataStore.put({ category, fetchedAt });

    await Promise.all([...articlePromises, metadataPromise]);
    await tx.done;
    console.log(`Saved/updated ${uniqueArticles.length} unique articles for '${category}' with fetchedAt ${fetchedAt} to IndexedDB.`);
  } catch (error) {
    console.error('Failed to save articles to IndexedDB:', error);
  }
}
