import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsProvider } from "@/providers/settings-provider";

export const metadata: Metadata = {
  metadataBase: new URL('https://get-news.app'), // Replace with your actual domain
  title: {
    default: "ReadOn",
    template: "%s | ReadOn",
  },
  description: "Your daily news, reimagined. Get the latest headlines, powered by intelligent search and personalized for you. Clean, fast, and focused on the news.",
  openGraph: {
    title: "ReadOn",
    description: "Your daily news, reimagined. Clean, fast, and focused on the news.",
    url: "https://get-news.app", // Replace with your actual domain
    siteName: "ReadOn",
    images: [
      {
        url: '/og-image.png', // Relative to metadataBase
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
    images: ['/og-image.png'], // Relative to metadataBase
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
      </body>
    </html>
  );
}
