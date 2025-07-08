import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { newsCategories } from '@/lib/categories';
import type { Article } from '@/lib/types';

/**
 * This is an API route that can be called by a scheduled job (e.g., a cron job).
 * It fetches news for all categories from the GNews API and stores them in Firestore.
 * To stay within the GNews free tier (100 requests/day), this endpoint
 * should be called periodically (e.g., every 2 hours), as each run makes one API request per category.
 * This can be configured in `netlify.toml` for Netlify deployments.
 */
export async function GET() {
  if (!db) {
    return NextResponse.json(
        { success: false, error: 'Firestore is not initialized. Check Firebase config.' },
        { status: 500 }
    );
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'GNEWS_API_KEY is not set' },
      { status: 500 }
    );
  }

  // Fetches for a default country and language.
  // This can be customized or extended if needed.
  const country = 'us';
  const language = 'en';

  try {
    const newsCollection = collection(db, 'news');
    const fetchPromises = newsCategories.map(async (category) => {
      const url = `https://gnews.io/api/v4/top-headlines?category=${category.slug}&lang=${language}&country=${country}&max=10&apikey=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`GNews API error for category ${category.slug}:`, await response.text());
        return; // Skip this category on error
      }

      const data = await response.json();
      const articles: Article[] = data.articles
        .map((article: any) => ({
          title: article.title,
          description: article.description || 'No description available.',
          url: article.url,
          imageUrl: article.image || 'https://placehold.co/600x400.png',
          publishedAt: article.publishedAt,
          source: {
            name: article.source.name,
            url: article.source.url,
          },
        }))
        .filter((article: any) => article.title !== '[Removed]');

      const docRef = doc(newsCollection, category.slug);
      await setDoc(docRef, {
        articles,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Successfully fetched and stored news for category: ${category.name}`);
    });

    await Promise.all(fetchPromises);

    return NextResponse.json({ success: true, message: 'News cache updated.' });
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
