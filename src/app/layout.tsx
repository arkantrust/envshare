import "./globals.css";
import type { Metadata, Viewport } from "next";

import { Heart } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

import { Analytics } from "@/components/analytics";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import { Header } from "./header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const title = "EnvShare: share environment variables securely";
const description =
  "Encrypt .env files in your browser and share them with a one-time link that expires after a set time or number of reads. The key never reaches the server.";
const ogImage = `${baseUrl}/api/v1/og?title=Share+Environment+Variables+Securely&subtitle=EnvShare`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: title, template: "%s | EnvShare" },
  description,
  keywords: ["envshare", "secure", "secrets", "share", "environment", "variables", ".env"],
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "EnvShare",
    title,
    description,
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: [ogImage] },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body className="relative flex min-h-screen flex-col bg-background text-foreground antialiased">
        {
          // Not everyone will want to host envshare on Vercel, so it makes sense to make this opt-in.
          process.env.ENABLE_VERCEL_ANALYTICS ? <Analytics /> : null
        }

        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>

        <Header />

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-8 text-center text-sm text-muted-foreground">
            <p>
              Built with{" "}
              <Heart
                className="mx-0.5 inline size-3.5 -translate-y-px fill-primary text-primary"
                aria-label="love"
              />{" "}
              by{" "}
              <Link
                href="https://ddulce.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                David Dulce
              </Link>
              , inspired by{" "}
              <Link
                href="https://envshare.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                envshare.dev
              </Link>
              .
            </p>
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
