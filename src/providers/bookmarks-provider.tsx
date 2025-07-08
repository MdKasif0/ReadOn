"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Article } from "@/lib/types";

interface BookmarksContextType {
  bookmarks: Article[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleUrl: string) => void;
  isBookmarked: (articleUrl: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(
  undefined
);

const BOOKMARKS_STORAGE_KEY = "getnews-bookmarks";

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error("Failed to load bookmarks from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage", error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = (article: Article) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.url === article.url)) {
        return prev;
      }
      return [...prev, article];
    });
  };

  const removeBookmark = (articleUrl: string) => {
    setBookmarks((prev) => prev.filter((b) => b.url !== articleUrl));
  };

  const isBookmarked = (articleUrl: string) => {
    return bookmarks.some((b) => b.url === articleUrl);
  };

  const value = { bookmarks, addBookmark, removeBookmark, isBookmarked };

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
};
