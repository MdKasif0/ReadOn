
'use client';

import type { Article } from "@/lib/types";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThumbsUp, MessageCircle, Share2, Bookmark } from "lucide-react";
import { BookmarkButton } from "./bookmark-button";

export function NewsStoryCard({ article }: { article: Article }) {

    const getInitials = (name: string) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0].charAt(0) + names[names.length - 1].charAt(0);
        }
        return name.substring(0, 2);
    }

    return (
        <div className="relative flex h-[75vh] max-h-[700px] w-full flex-col rounded-3xl bg-[#FEF5D9] p-6 text-black shadow-lg">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                        LIVE
                    </div>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tighter">
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
                <p>{article.description}</p>
            </div>
            
            <div className="mt-auto flex justify-around rounded-full bg-black/5 p-2">
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-600 hover:bg-black/10 hover:text-black">
                    <ThumbsUp className="h-5 w-5" />
                </Button>
                 <BookmarkButton 
                    article={article} 
                    className="text-neutral-600 hover:bg-black/10 hover:text-black"
                />
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-600 hover:bg-black/10 hover:text-black">
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
