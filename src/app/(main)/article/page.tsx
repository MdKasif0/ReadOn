'use client';

import { Suspense } from 'react';
import { ArticleDetailClient } from '@/components/article-detail-client';
import { Loader2 } from 'lucide-react';

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
