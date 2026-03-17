import Link from "next/link";

import { Stats } from "@/components/stats";
import { Testimonials } from "@/components/testimony";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-8 md:gap-16 md:pb-16 xl:pb-24">
      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-center px-8 sm:mt-0 sm:min-h-screen sm:px-0">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <Link
            href="https://github.com/chronark/envshare"
            className="relative overflow-hidden rounded-full px-4 py-1.5 text-sm leading-6 text-zinc-400 ring-1 ring-zinc-100/10 duration-150 hover:ring-zinc-100/30"
          >
            EnvShare is Open Source on{" "}
            <span className="font-semibold text-zinc-200">
              GitHub <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </div>
        <div>
          <h1 className="bg-linear-to-t from-zinc-100/50 to-white bg-clip-text py-4 text-center text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
            Share Environment Variables Securely
          </h1>

          <Link
            href="/share"
            aria-label="Share environment variables"
            className="group mx-auto mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-linear-to-r from-zinc-50 to-zinc-200 px-6 py-2.5 text-base leading-7 font-semibold text-zinc-900 shadow-lg ring-1 shadow-zinc-950/20 ring-zinc-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:from-zinc-100 hover:to-zinc-300 hover:shadow-xl hover:shadow-zinc-950/30 focus-visible:ring-2 focus-visible:ring-zinc-300/80 focus-visible:outline-none sm:w-2/3 sm:max-w-lg sm:text-center md:w-1/2 md:py-3"
          >
            <span>Share</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-balance text-zinc-400 sm:text-center sm:text-lg">
            Your document is encrypted in your browser before being stored for a limited period.
            Unencrypted data never leaves your device.
          </p>
        </div>
      </div>
      <h2 className="py-4 text-center text-3xl font-bold text-zinc-300 ">
        Used and trusted by a growing community
      </h2>
      <Stats />
      <Testimonials />
    </div>
  );
}
