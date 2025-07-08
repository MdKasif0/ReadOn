import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Search, Bookmark } from "lucide-react";

const features = [
  {
    icon: Newspaper,
    title: "Curated Headlines",
    description: "Get the most important stories from trusted sources worldwide, updated throughout the day.",
  },
  {
    icon: Search,
    title: "AI-Powered Search",
    description: "Find any article instantly with our smart search that understands what you're looking for.",
  },
  {
    icon: Bookmark,
    title: "Personal Bookmarks",
    description: "Save articles to read later and build your own personal library of important stories.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Logo />
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter text-primary md:text-6xl">
              Your Daily News, Reimagined.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              ReadOn brings you the latest headlines, powered by intelligent
              search and personalized for you. Clean, fast, and focused on the news.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started For Free</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="container py-12">
            <Image
                src="https://placehold.co/1200x600.png"
                alt="ReadOn app screenshot"
                width={1200}
                height={600}
                className="rounded-xl border shadow-xl"
                data-ai-hint="news technology"
            />
        </section>
        <section className="container py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need to Stay Informed
            </h2>
            <p className="mt-2 text-muted-foreground">
              All the tools you need to read, search, and save the news that matters.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl justify-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="p-2">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex items-center justify-between">
            <Logo />
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ReadOn, Inc.
            </p>
        </div>
      </footer>
    </div>
  );
}
