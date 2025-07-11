
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { newsCategories } from '@/lib/categories';
import type { Article } from '@/lib/types';

// Helper function to process and filter articles from an API response
const processArticles = (results: any[]): Article[] => {
  return (results || [])
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
    .filter((article: any) => article.title && article.url && article.title !== '[Removed]');
};

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
    const currentHour = new Date().getUTCHours();
    const isOddHour = currentHour % 2 !== 0;

    const allCategorySlugs = newsCategories.map(c => c.slug);
    const groupA = allCategorySlugs.slice(0, 8); // top, world, domestic, business, technology, entertainment, sports, science
    const groupB = allCategorySlugs.slice(8);    // health, politics, crime, education, lifestyle, environment, tourism, other

    const categoriesToFetch = isOddHour ? groupA : groupB;

    console.log(`Cron job: Running for hour ${currentHour} (UTC). Fetching group ${isOddHour ? 'A' : 'B'}: ${categoriesToFetch.join(', ')}`);

    const newsCollection = collection(db, 'news');
    
    const fetchPromises = categoriesToFetch.map(async (categorySlug) => {
      const searchParams = new URLSearchParams({
        apikey: apiKey,
        language,
        country,
        category: categorySlug,
        size: '10',
      });
      const url = `https://newsdata.io/api/1/news?${searchParams.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Newsdata.io API error for category ${categorySlug}:`, await response.text());
        return; // Skip this category on error
      }
      
      const data = await response.json();
      const articles = processArticles(data.results);

      if (articles.length > 0) {
        const docRef = doc(newsCollection, categorySlug);
        await setDoc(docRef, {
          articles: articles,
          fetchedAt: new Date().toISOString(),
        });
        console.log(`Successfully fetched and stored ${articles.length} articles for category: ${categorySlug}`);
      }
    });

    await Promise.all(fetchPromises);

    return NextResponse.json({ success: true, message: `News cache updated for group ${isOddHour ? 'A' : 'B'}.` });
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
