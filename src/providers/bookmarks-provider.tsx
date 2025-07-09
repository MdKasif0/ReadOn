"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Article, Bookmark } from "@/lib/types";

interface BookmarksContextType {
  bookmarks: Bookmark[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleUrl: string) => void;
  updateBookmark: (articleUrl: string, data: { notes?: string; tags?: string[] }) => void;
  isBookmarked: (articleUrl: string) => boolean;
  getBookmark: (articleUrl: string) => Bookmark | undefined;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(
  undefined
);

const BOOKMARKS_STORAGE_KEY = "readon-bookmarks";

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Migration logic for old data format
        if (parsedData.length > 0 && parsedData[0].article === undefined) {
          const migratedBookmarks: Bookmark[] = parsedData.map((article: Article) => ({
            article,
            notes: '',
            tags: [],
            addedAt: Date.now(),
          }));
          setBookmarks(migratedBookmarks);
        } else {
          setBookmarks(parsedData);
        }
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
      if (prev.some((b) => b.article.url === article.url)) {
        return prev;
      }
      const newBookmark: Bookmark = {
        article,
        notes: "",
        tags: [],
        addedAt: Date.now(),
      };
      return [newBookmark, ...prev].sort((a, b) => b.addedAt - a.addedAt);
    });
  };

  const removeBookmark = (articleUrl: string) => {
    setBookmarks((prev) => prev.filter((b) => b.article.url !== articleUrl));
  };

  const updateBookmark = (articleUrl: string, data: { notes?: string; tags?: string[] }) => {
    setBookmarks((prev) =>
      prev.map((b) =>
        b.article.url === articleUrl ? { ...b, ...data } : b
      )
    );
  };

  const isBookmarked = (articleUrl: string) => {
    return bookmarks.some((b) => b.article.url === articleUrl);
  };

  const getBookmark = (articleUrl: string) => {
    return bookmarks.find((b) => b.article.url === articleUrl);
  };

  const value = { bookmarks, addBookmark, removeBookmark, updateBookmark, isBookmarked, getBookmark };

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
