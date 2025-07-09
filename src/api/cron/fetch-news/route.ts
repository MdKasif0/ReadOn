
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { newsCategories } from '@/lib/categories';
import type { Article } from '@/lib/types';

/**
 * This is an API route that can be called by a scheduled job (e.g., a cron job).
 * It fetches news for all categories from the Newsdata.io API and stores them in Firestore.
 * This can be configured in `netlify.toml` for Netlify deployments.
 */
export async function GET() {
  if (!db) {
    return NextResponse.json(
        { success: false, error: 'Firestore is not initialized. Check Firebase config.' },
        { status: 500 }
    );
  }

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'NEWSDATA_API_KEY is not set' },
      { status: 500 }
    );
  }

  const country = 'us';
  const language = 'en';

  try {
    const newsCollection = collection(db, 'news');
    const fetchPromises = newsCategories.map(async (category) => {
      const searchParams = new URLSearchParams({
        apikey: apiKey,
        language: language,
        country: country,
        category: category.slug,
      });

      const url = `https://newsdata.io/api/1/news?${searchParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Newsdata.io API error for category ${category.slug}:`, await response.text());
        return; // Skip this category on error
      }

      const data = await response.json();
      const articles: Article[] = (data.results || [])
        .map((article: any) => ({
          title: article.title,
          description: article.description || 'No description available.',
          content: article.content || '',
          url: article.link,
          imageUrl: article.image_url || 'https://placehold.co/600x400.png',
          publishedAt: article.pubDate,
          source: {
            name: article.source_id || 'Unknown Source',
            url: article.source_url || '#',
          },
        }))
        .filter((article: any) => article.title && article.url);

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
