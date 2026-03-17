import "./globals.css";
import type { Metadata } from "next";

import { Montserrat } from "next/font/google";
import Link from "next/link";

import { Analytics } from "@/components/analytics";

import { Header } from "./header";

const montserrat = Montserrat({
  subsets: ["latin"],
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: "EnvShare",
  description: "Share Environment Variables Securely",
  keywords: ["envshare", "secure", "secrets", "share", "environment", "variables"],
  openGraph: {
    type: "website",
    url: baseUrl,
    title: "Share Environment Variables Securely",
    description: "EnvShare",
    images: [
      {
        url: `${baseUrl}/api/v1/og?title=Share+Environment+Variables+Securely&subtitle=EnvShare`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Environment Variables Securely",
    description: "EnvShare",
    images: [`${baseUrl}/api/v1/og?title=Share+Environment+Variables+Securely&subtitle=EnvShare`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.className}>
      <body className="relative min-h-screen bg-black bg-linear-to-tr from-zinc-900/50 to-zinc-700/30">
        {
          // Not everyone will want to host envshare on Vercel, so it makes sense to make this opt-in.
          process.env.ENABLE_VERCEL_ANALYTICS ? <Analytics /> : null
        }

        <Header />

        <main className=" min-h-[80vh] ">{children}</main>

        <footer className="inset-2x-0 bottom-0 border-t border-zinc-500/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-12 text-center text-xs text-zinc-700 lg:px-8">
            <p>
              Built by{" "}
              <Link
                href="https://twitter.com/chronark_"
                className="font-semibold duration-150 hover:text-zinc-200"
              >
                @chronark_
              </Link>
              and{" "}
              <Link
                href="https://github.com/chronark/envshare/graphs/contributors"
                className="underline duration-150 hover:text-zinc-200"
              >
                many others{" "}
              </Link>
            </p>
            <p>
              EnvShare is deployed on{" "}
              <Link
                target="_blank"
                href="https://vercel.com"
                className="underline duration-150 hover:text-zinc-200"
              >
                Vercel
              </Link>{" "}
              and uses{" "}
              <Link
                target="_blank"
                href="https://upstash.com"
                className="underline duration-150 hover:text-zinc-200"
              >
                Upstash
              </Link>{" "}
              for storing encrypted data.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
