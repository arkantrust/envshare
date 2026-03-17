import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";
import { Header } from "./header";
import { Analytics } from "@components/analytics";
import type { Metadata } from "next";

const inter = localFont({
  src: "../public/fonts/Inter-SemiBold.ttf",
  variable: "--font-inter",
});

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen bg-black bg-gradient-to-tr from-zinc-900/50 to-zinc-700/30">
        {
          // Not everyone will want to host envshare on Vercel, so it makes sense to make this opt-in.
          process.env.ENABLE_VERCEL_ANALYTICS ? <Analytics /> : null
        }

        <Header />

        <main className=" min-h-[80vh] ">{children}</main>

        <footer className="bottom-0 border-t inset-2x-0 border-zinc-500/10">
          <div className="flex flex-col gap-1 px-6 py-12 mx-auto text-xs text-center text-zinc-700 max-w-7xl lg:px-8">
            <p>
              Built by{" "}
              <Link href="https://twitter.com/chronark_" className="font-semibold duration-150 hover:text-zinc-200">
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
              <Link target="_blank" href="https://vercel.com" className="underline duration-150 hover:text-zinc-200">
                Vercel
              </Link>{" "}
              and uses{" "}
              <Link target="_blank" href="https://upstash.com" className="underline duration-150 hover:text-zinc-200">
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
