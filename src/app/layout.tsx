
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsProvider } from "@/providers/settings-provider";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://read-on.netlify.app/'),
  title: {
    default: "ReadOn",
    template: "%s | ReadOn",
  },
  description: "Your daily news, reimagined. Get the latest headlines, powered by intelligent search and personalized for you. Clean, fast, and focused on the news.",
  manifest: "/manifest.json",
  openGraph: {
    title: "ReadOn",
    description: "Your daily news, reimagined. Clean, fast, and focused on the news.",
    url: "https://read-on.netlify.app/",
    siteName: "ReadOn",
    images: [
      {
        url: '/readon-cover.png',
        width: 1200,
        height: 630,
        alt: 'ReadOn - Your Daily News, Reimagined',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReadOn',
    description: 'Your daily news, reimagined. Clean, fast, and focused on the news.',
    images: ['/readon-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <BookmarksProvider>
                {children}
                <Toaster />
              </BookmarksProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').then(registration => {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
