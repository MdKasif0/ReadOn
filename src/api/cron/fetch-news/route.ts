
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
    console.log(`Cron job: Starting to fetch news for all categories.`);

    const newsCollection = collection(db, 'news');
    
    const fetchPromises = newsCategories.map(async (category) => {
      // Using a Map to deduplicate articles by their URL
      const articleMap = new Map<string, Article>();
      let nextPage: string | null = null;

      // --- Fetch first page ---
      const searchParamsPage1 = new URLSearchParams({
        apikey: apiKey,
        language,
        country,
        category: category.slug,
        size: '10',
      });
      const urlPage1 = `https://newsdata.io/api/1/news?${searchParamsPage1.toString()}`;
      
      const responsePage1 = await fetch(urlPage1);
      if (!responsePage1.ok) {
        console.error(`Newsdata.io API error for category ${category.slug} (Page 1):`, await responsePage1.text());
        return; // Skip this category on error
      }
      
      const dataPage1 = await responsePage1.json();
      const articlesPage1 = processArticles(dataPage1.results);
      articlesPage1.forEach(article => articleMap.set(article.url, article));
      nextPage = dataPage1.nextPage || null;

      // --- Fetch second page if available ---
      if (nextPage) {
        const searchParamsPage2 = new URLSearchParams({
          apikey: apiKey,
          language,
          country,
          category: category.slug,
          size: '10',
          page: nextPage,
        });
        const urlPage2 = `https://newsdata.io/api/1/news?${searchParamsPage2.toString()}`;

        const responsePage2 = await fetch(urlPage2);
        if (!responsePage2.ok) {
          console.error(`Newsdata.io API error for category ${category.slug} (Page 2):`, await responsePage2.text());
          // We still save page 1 data even if page 2 fails
        } else {
            const dataPage2 = await responsePage2.json();
            const articlesPage2 = processArticles(dataPage2.results);
            articlesPage2.forEach(article => articleMap.set(article.url, article));
        }
      }

      const allArticles = Array.from(articleMap.values());

      if (allArticles.length > 0) {
        const docRef = doc(newsCollection, category.slug);
        // Save deduplicated articles and the timestamp
        await setDoc(docRef, {
          articles: allArticles,
          fetchedAt: new Date().toISOString(),
        });
        console.log(`Successfully fetched and stored ${allArticles.length} articles for category: ${category.name}`);
      }
    });

    await Promise.all(fetchPromises);

    return NextResponse.json({ success: true, message: `News cache updated for all categories.` });
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
