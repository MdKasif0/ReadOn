import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { Article } from '@/lib/types';

/**
 * This is a server-side only helper to fetch an article.
 * In a real-world app, this would be more robust, potentially querying
 * a dedicated 'articles' collection by URL.
 * 
 * For this demo, we will simulate this by searching through the cached
 * news categories in Firestore to find a matching article URL. This is
 * not efficient for a large-scale app but works for this context.
 */
export async function getArticleByUrl(url: string): Promise<Article | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot fetch article on server.");
    return null;
  }

  try {
    const newsCollection = collection(db, 'news');
    const q = query(newsCollection);
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const articles = (data.articles || []) as Article[];
      const foundArticle = articles.find(article => article.url === url);
      
      if (foundArticle) {
        console.log(`Found article "${foundArticle.title}" on server in category '${doc.id}'.`);
        return foundArticle;
      }
    }

    console.warn(`Article with URL "${url}" not found in any Firestore cache document.`);
    return null;
  } catch (error) {
    console.error(`Error fetching article with URL "${url}" from Firestore:`, error);
    return null;
  }
}
