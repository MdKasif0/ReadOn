"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

const searchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
});

export function SearchForm({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  function onSubmit(values: z.infer<typeof searchSchema>) {
    router.push(`/?q=${encodeURIComponent(values.query)}`);
    if (onSearch) {
      onSearch();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative w-full max-w-lg">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} placeholder="Search articles..." className="pl-10 h-10" />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
         <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7" variant="ghost">
            Search
        </Button>
      </form>
    </Form>
  );
}
