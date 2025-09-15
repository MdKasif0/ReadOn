import type { Article } from "@/lib/types";
import { BookmarkCard } from "@/components/bookmark-card";
import type { Bookmark } from "@/lib/types";


interface ArticleGridProps {
  articles?: Article[];
  bookmarks?: Bookmark[];
  children?: React.ReactNode;
  displayMode?: 'grid' | 'search';
}

export function ArticleGrid({ articles, bookmarks, children, displayMode = 'grid' }: ArticleGridProps) {
  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
      {articles && articles.map((article) => <BookmarkCard key={article.url} bookmark={{ article, notes: '', tags: [], addedAt: 0 }} displayMode={displayMode} />)}
      {bookmarks && bookmarks.map((bookmark) => <BookmarkCard key={bookmark.article.url} bookmark={bookmark} displayMode={displayMode} />)}
      {children}
    </div>
  );
}
