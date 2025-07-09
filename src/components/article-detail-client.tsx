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
import { followUpOnArticle } from '@/ai/flows/article-follow-up';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getArticleByUrl } from '@/lib/indexed-db';

export function ArticleDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState(0);
  const [isShareSupported, setIsShareSupported] = useState(false);

  useEffect(() => {
    // This check runs only once on the client after mount.
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  useEffect(() => {
    const articleUrl = searchParams.get('url');
    if (articleUrl) {
      const decodedUrl = decodeURIComponent(articleUrl);
      getArticleByUrl(decodedUrl)
        .then((cachedArticle) => {
          if (cachedArticle) {
            setArticle(cachedArticle);
          } else {
            console.error(`Article with url ${decodedUrl} not found in cache. Redirecting.`);
            router.push('/feed');
          }
        })
        .catch((err) => {
          console.error('Error fetching article from DB', err);
          router.push('/feed');
        });
    } else {
      router.push('/feed'); // Redirect if no url
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (article) {
      // Set random view/comment counts only on the client-side after mount
      setViews(Math.floor(Math.random() * 2000));
      setComments(Math.floor(Math.random() * 100));
    }
  }, [article]);

  const handleShare = async () => {
    if (article && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing article:', error);
      }
    }
  };

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

  if (!article) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const shareLinks = [
    { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}` },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + article.url)}` },
  ];

  return (
    <div className="relative min-h-screen bg-card text-card-foreground">
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-2 md:p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60" onClick={() => router.back()}>
          <X />
        </Button>
        <div className="flex items-center space-x-1 md:space-x-2">
          <BookmarkButton article={article} className="bg-black/40 text-white rounded-full hover:bg-black/60 hover:text-white" />
          
          {isShareSupported ? (
            <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60" onClick={handleShare}>
              <Share2 />
            </Button>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-black/40 text-white rounded-full hover:bg-black/60">
                  <Share2 />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-center mb-1">Share via</p>
                  {shareLinks.map(link => (
                    <Button asChild variant="outline" key={link.name}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        {link.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

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
            Image from source
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">{article.title}</h1>
          
          <div className="mt-6 flex flex-wrap items-center justify-between gap-y-2 text-xs text-foreground/60">
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
          
          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90 md:text-lg">
              {article.description ? (
                  article.description.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                  ))
              ) : null }

              {article.content && article.content !== article.description ? (
                  article.content.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                      <p key={`content-${index}`} className="mt-4 italic text-muted-foreground">{paragraph}</p>
                  ))
              ) : null}

              {!article.description && !article.content && (
                  <div className="mt-6 rounded-md border border-dashed p-6 text-center">
                      <p className="text-muted-foreground">The content for this article could not be loaded.</p>
                      <p className="text-sm text-muted-foreground">Please use the link below to read the full story at the source.</p>
                  </div>
              )}
          </div>

          <Button asChild className="mt-8">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read Full Article
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
            
          {followUpHistory.length > 0 && (
              <div className="mt-8 space-y-4 border-t pt-6">
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
