import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingPageRedirector } from "@/components/landing-page-redirector";

export default function LandingPage() {
  return (
    <LandingPageRedirector>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white">
        {/* Background Image Container */}
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/background-cover.png')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Stay Informed.
              <br />
              Instantly.
            </h1>
            <p className="max-w-md text-lg text-neutral-300">
              Your personalized news, curated and cached for speed — even
              offline.
            </p>
          </div>
        </main>

        <footer className="relative z-10 w-full p-8">
          <Button
            size="lg"
            asChild
            className="w-full max-w-sm rounded-full bg-gradient-to-r from-blue-500 to-purple-600 py-6 text-lg font-bold text-white shadow-lg hover:shadow-xl"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </footer>
      </div>
    </LandingPageRedirector>
  );
}
