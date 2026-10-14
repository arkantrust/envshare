import { ArrowDownIcon, LockKeyholeIcon } from "lucide-react";
import { Suspense } from "react";

import { EncryptDemo } from "@/components/encrypt-demo";
import { HowItWorks } from "@/components/how-it-works";
import { ShareForm } from "@/components/share-form";
import { Stats, StatsSkeleton } from "@/components/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative overflow-hidden px-6 pt-20 pb-8 sm:pt-28">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-112 w-176 max-w-full animate-glow rounded-full bg-primary/30 blur-[120px]"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="animate-in gap-1.5 duration-700 fade-in slide-in-from-bottom-2"
          >
            <LockKeyholeIcon className="size-3" />
            End-to-end encrypted in your browser
          </Badge>
          <h1 className="animate-in text-5xl font-bold tracking-tight delay-150 duration-700 fill-mode-both fade-in slide-in-from-bottom-4 sm:text-7xl">
            Share environment variables{" "}
            <span className="bg-linear-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              securely
            </span>
          </h1>
          <p className="max-w-xl animate-in text-lg text-balance text-muted-foreground delay-300 duration-700 fill-mode-both fade-in slide-in-from-bottom-4">
            Your document is encrypted before it leaves your device and deleted after a limited time
            or number of reads. We never see the key.
          </p>
          <Button
            size="lg"
            className="h-12 animate-in px-6 text-base delay-500 duration-700 fill-mode-both zoom-in-95 fade-in"
            nativeButton={false}
            render={<a href="#share" />}
          >
            Share your .env
            <ArrowDownIcon className="animate-bounce" />
          </Button>
          <div className="mt-6 w-full animate-in delay-700 duration-700 fill-mode-both fade-in slide-in-from-bottom-4">
            <EncryptDemo />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6">
        <ShareForm />
      </section>

      <HowItWorks />

      <section aria-label="Usage statistics" className="mx-auto w-full max-w-4xl px-6">
        <Suspense fallback={<StatsSkeleton />}>
          <Stats />
        </Suspense>
      </section>
    </div>
  );
}
