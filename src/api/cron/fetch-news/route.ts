
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { newsCategories } from '@/lib/categories';
import type { Article } from '@/lib/types';

const BATCH_SIZE = 3; // Fetch 3 categories per run to stay within API limits

/**
 * This is an API route that can be called by a scheduled job (e.g., a cron job).
 * It fetches news for a small batch of categories from the Newsdata.io API
 * and stores them in Firestore. It cycles through all categories over time.
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
    // Logic to get the next batch of categories to fetch
    const stateDocRef = doc(db, 'cron_state', 'last_batch');
    const stateDoc = await getDoc(stateDocRef);
    const lastIndex = stateDoc.exists() ? stateDoc.data().index : -1;
    
    const totalBatches = Math.ceil(newsCategories.length / BATCH_SIZE);
    const nextIndex = (lastIndex + 1) % totalBatches;

    const start = nextIndex * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const categoriesToFetch = newsCategories.slice(start, end);

    console.log(`Cron job: Fetching batch ${nextIndex + 1}/${totalBatches}. Categories: ${categoriesToFetch.map(c => c.name).join(', ')}`);

    const newsCollection = collection(db, 'news');
    const fetchPromises = categoriesToFetch.map(async (category) => {
      const searchParams = new URLSearchParams({
        apikey: apiKey,
        language: language,
        country: country,
        category: category.slug,
        size: '10' // Newsdata.io uses 'size' for number of articles
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

    // Update the state for the next run
    await setDoc(stateDocRef, { index: nextIndex, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, message: `News cache updated for batch ${nextIndex + 1}.` });
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
