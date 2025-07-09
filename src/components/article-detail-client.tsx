'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Article } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkButton } from '@/components/bookmark-button';
import {
  X,
  Share2,
  MoreVertical,
  Paperclip,
  Mic,
  Clock,
  Eye,
  MessageCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { analyzeArticle } from '@/ai/flows/article-analyzer';
import { followUpOnArticle } from '@/ai/flows/article-follow-up';
import { formatDistanceToNow } from 'date-fns';
import { newsCategories } from '@/lib/categories';
import Link from 'next/link';

export function ArticleDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    const articleData = searchParams.get('data');
    if (articleData) {
      try {
        const decodedArticle = JSON.parse(decodeURIComponent(articleData));
        setArticle(decodedArticle);

        const analysisInput = {
          title: decodedArticle.title,
          description: decodedArticle.description,
        };

        analyzeArticle(analysisInput)
          .then(setAnalysis)
          .catch(console.error)
          .finally(() => setIsLoadingAnalysis(false));

      } catch (error) {
        console.error("Failed to parse article data", error);
        router.push('/feed'); // Redirect if data is invalid
      }
    } else {
        router.push('/feed'); // Redirect if no data
    }
  }, [searchParams, router]);
  
  useEffect(() => {
    // Set random view/comment counts only on the client-side after mount
    if (article) {
        setViews(Math.floor(Math.random() * 2000));
        setComments(Math.floor(Math.random() * 100));
    }
  }, [article]);

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || !article) return;

    setIsAsking(true);
    const question = followUpQuery;
    setFollowUpQuery('');

    try {
      const input = {
          title: article.title,
          description: article.description,
          question: question,
      };
      const result = await followUpOnArticle(input);
      setFollowUpHistory(prev => [...prev, { question, answer: result.answer }]);
    } catch (error) {
        console.error("Failed to get follow-up answer:", error);
        setFollowUpHistory(prev => [...prev, { question, answer: "Sorry, I couldn't get an answer for that." }]);
    } finally {
        setIsAsking(false);
    }
  };

  const getCategorySlug = (topic: string) => {
    const category = newsCategories.find(
      (c) => c.name.toLowerCase() === topic.toLowerCase()
    );
    return category ? category.slug : null;
  };

  if (!article) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-card text-card-foreground">
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-2 md:p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60" onClick={() => router.back()}>
          <X />
        </Button>
        <div className="flex items-center space-x-1 md:space-x-2">
          <BookmarkButton article={article} className="bg-black/40 text-white rounded-full hover:bg-black/60 hover:text-white" />
          <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60">
            <Share2 />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60">
            <MoreVertical />
          </Button>
        </div>
      </header>

      <main className="pb-24">
        <div className="relative w-full">
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            Image from Unsplash
          </div>
        </div>

        <div className="p-4">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          
          {(article.content || article.description) && (
            <blockquote className="mt-6 border-l-4 border-primary/50 pl-4 text-foreground/80">
              {article.content || article.description}
            </blockquote>
          )}

          <Button asChild className="mt-6">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read Full Article
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          
          <div className="mt-8 flex flex-wrap items-center justify-between gap-y-2 text-xs text-foreground/60">
            <div className="flex items-center gap-2">
               <Avatar className="h-6 w-6">
                <AvatarImage src={`https://logo.clearbit.com/${new URL(article.source.url).hostname}`} alt={article.source.name} />
                <AvatarFallback>{article.source.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Curated by <b>{article.source.name}</b></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(article.publishedAt))} ago</div>
              <div className="flex items-center gap-1"><Eye className="h-3 w-3" /> {views}</div>
              <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {comments}</div>
            </div>
          </div>
          
          <div className="mt-6">
              {isLoadingAnalysis ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : analysis && (
                  <div className="flex flex-wrap gap-2">
                      {analysis.relatedTopics.map((topic: string) => {
                          const slug = getCategorySlug(topic);
                          if (!slug) {
                              return (
                                  <Button key={topic} variant="secondary" size="sm" className="rounded-full h-auto py-1.5 cursor-default opacity-70">
                                      #{topic}
                                  </Button>
                              );
                          }
                          return (
                              <Button key={topic} variant="secondary" size="sm" asChild className="rounded-full h-auto py-1.5">
                                  <Link href={`/feed?category=${slug}`}>
                                      #{topic}
                                  </Link>
                              </Button>
                          );
                      })}
                  </div>
              )}
          </div>
            
          {followUpHistory.length > 0 && (
              <div className="mt-6 space-y-4 border-t pt-4">
                  {followUpHistory.map((item, index) => (
                      <div key={index}>
                          <p className="font-semibold text-primary">{item.question}</p>
                          <p className="text-foreground/90 whitespace-pre-wrap">{item.answer}</p>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-2 bg-card border-t border-border">
        <form onSubmit={handleFollowUpSubmit} className="relative">
          <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Ask follow-up..." 
            className="pl-10 pr-10 rounded-full bg-muted border-none focus-visible:ring-2 focus-visible:ring-ring"
            value={followUpQuery}
            onChange={(e) => setFollowUpQuery(e.target.value)}
            disabled={isAsking}
          />
          {isAsking ? (
             <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
             <Mic className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          )}
        </form>
      </footer>
    </div>
  );
}
