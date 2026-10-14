"use client";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center sm:py-32">
      <p className="text-sm font-medium text-primary">Something went wrong</p>
      <h1 className="text-4xl font-bold tracking-tight">Unexpected error</h1>
      <p className="text-muted-foreground">
        Nothing you typed was sent anywhere. Try again, and if it keeps happening, reload the page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
