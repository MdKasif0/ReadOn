'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBookmarks } from '@/providers/bookmarks-provider';
import type { Bookmark } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const bookmarkFormSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional(),
  tags: z.string().optional(),
});

type BookmarkFormValues = z.infer<typeof bookmarkFormSchema>;

interface EditBookmarkSheetProps {
  bookmark: Bookmark;
  children: React.ReactNode;
}

export function EditBookmarkSheet({ bookmark, children }: EditBookmarkSheetProps) {
  const { updateBookmark } = useBookmarks();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      notes: bookmark.notes || '',
      tags: bookmark.tags?.join(', ') || '',
    },
  });

  const onSubmit = (data: BookmarkFormValues) => {
    const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    updateBookmark(bookmark.article.url, {
      notes: data.notes || '',
      tags: tagsArray,
    });
    toast({
      title: 'Bookmark updated!',
      description: 'Your notes and tags have been saved.',
    });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Bookmark</SheetTitle>
          <SheetDescription className="line-clamp-2">{bookmark.article.title}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your personal notes here..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="tech, ai, news" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter comma-separated tags.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
