import { Suspense } from 'react';
import { ArticleDetailClient } from '@/components/article-detail-client';
import { Loader2 } from 'lucide-react';
import { getArticleByUrl } from '@/lib/indexed-db.server';
import type { Metadata } from 'next';

type ArticlePageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: ArticlePageProps): Promise<Metadata> {
  const articleUrl = searchParams.url;

  if (typeof articleUrl !== 'string') {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  const decodedUrl = decodeURIComponent(articleUrl);
  // We attempt to fetch from a server-side cache/DB if available.
  const article = await getArticleByUrl(decodedUrl);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      url: article.url,
      images: [
        {
          url: article.imageUrl,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.imageUrl],
    },
  };
}


function LoadingFallback() {
    return (
        <div className="h-screen w-full bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ArticleDetailClient />
    </Suspense>
  );
}
