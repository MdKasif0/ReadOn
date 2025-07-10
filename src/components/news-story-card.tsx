
'use client';

import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThumbsUp, Share2 } from "lucide-react";
import { BookmarkButton } from "./bookmark-button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";


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

    return (
        <div 
            className="group relative flex h-[75vh] max-h-[700px] w-full flex-col overflow-hidden rounded-3xl text-black shadow-lg transition-transform duration-500 ease-in-out"
            style={{ backgroundColor: color }}
        >
            <Link href={`/article?url=${articleUrl}`} className="flex flex-col flex-1 h-full">
                <div className="relative h-1/3 w-full flex-shrink-0">
                    <Image
                        src={article.imageUrl}
                        alt={article.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                    />
                     <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                        LIVE
                    </div>
                </div>
                
                <div className="flex flex-1 flex-col p-6">
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-extrabold leading-tight tracking-tighter line-clamp-3">
                            {article.title}
                        </h1>
                        <p className="mt-2 text-xs text-neutral-500">Updated just now.</p>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://i.pravatar.cc/40?u=${article.source.name}`} />
                                    <AvatarFallback>{getInitials(article.source.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">Published by</p>
                                    <p className="text-sm font-bold -mt-1">{article.source.name}</p>
                                </div>
                            </div>
                            <Button className="rounded-full bg-black text-white hover:bg-neutral-800">Follow</Button>
                        </div>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto text-base text-neutral-700">
                        <p className="line-clamp-4">{article.description}</p>
                    </div>
                </div>
            </Link>
            
            <div className="absolute bottom-4 right-4 flex flex-col items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/5 text-neutral-600 hover:bg-black/10 hover:text-black">
                    <ThumbsUp className="h-6 w-6" />
                </Button>
                 <BookmarkButton 
                    article={article} 
                    className="rounded-full h-12 w-12 bg-black/5 text-neutral-600 hover:bg-black/10 hover:text-black"
                    activeClassName="bg-red-500 text-white"
                />
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/5 text-neutral-600 hover:bg-black/10 hover:text-black">
                    <Share2 className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
