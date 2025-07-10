
'use client';

import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThumbsUp, Share2 } from "lucide-react";
import { BookmarkButton } from "./bookmark-button";
import Link from "next/link";
import Image from "next/image";

export function NewsStoryCard({ article, color }: { article: Article, color: string }) {

    const getInitials = (name: string) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0].charAt(0) + names[names.length - 1].charAt(0);
        }
        return name.substring(0, 2);
    }
    
    const articleUrl = encodeURIComponent(article.url);
    const sourceHostname = article.source.url ? new URL(article.source.url).hostname : '';

    return (
        <div 
            className="group relative flex h-[75vh] max-h-[700px] w-full flex-col overflow-hidden rounded-3xl text-black shadow-lg"
            style={{ backgroundColor: color }}
        >
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end p-4">
                 <div className="flex items-center gap-2 rounded-full bg-black/10 p-1 backdrop-blur-sm">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-neutral-600 hover:bg-black/10 hover:text-black">
                        <ThumbsUp className="h-5 w-5" />
                    </Button>
                    <BookmarkButton 
                        article={article} 
                        className="h-10 w-10 rounded-full text-neutral-600 hover:bg-black/10 hover:text-black"
                        activeClassName="!bg-primary !text-primary-foreground"
                    />
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-neutral-600 hover:bg-black/10 hover:text-black">
                        <Share2 className="h-5 w-5" />
                    </Button>
                 </div>
            </div>

            <div className="flex flex-col flex-1 h-full">
                <Link href={`/article?url=${articleUrl}`} className="relative h-1/3 w-full flex-shrink-0">
                    <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
                
                <div className="flex flex-1 flex-col p-6 pb-20">
                    <div className="flex-shrink-0">
                        <Link href={`/article?url=${articleUrl}`}>
                            <h1 className="text-2xl font-extrabold leading-tight tracking-tighter line-clamp-3 hover:underline">
                                {article.title}
                            </h1>
                        </Link>
                        <p className="mt-2 text-xs text-neutral-500">Updated just now.</p>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://logo.clearbit.com/${sourceHostname}`} alt={article.source.name} />
                                    <AvatarFallback>{getInitials(article.source.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">Published by</p>
                                    <p className="text-sm font-bold -mt-1">{article.source.name}</p>
                                </div>
                            </div>
                            <Button asChild className="rounded-full bg-black text-white hover:bg-neutral-800">
                                <Link href={`/article?url=${articleUrl}`}>Read Article</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto text-base text-neutral-700">
                        <p className="line-clamp-4">{article.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
