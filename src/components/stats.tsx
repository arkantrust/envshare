"use client";
import { useEffect, useState } from "react";

import { CountUp } from "@/components/count-up";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; reads: number; writes: number };

export function Stats() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/stats", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<{ reads: number; writes: number }>;
      })
      .then(({ reads, writes }) => setState({ status: "ready", reads, writes }))
      .catch((e) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load stats", e);
          setState({ status: "error" });
        }
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Card size="sm">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Usage stats are unavailable right now.
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Documents encrypted", value: state.writes },
    { label: "Documents decrypted", value: state.reads },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {stats.map(({ label, value }) => (
        <li key={label}>
          <Card size="sm" className="h-full">
            <CardContent className="flex flex-col items-center gap-1 py-4">
              <span className="text-4xl font-bold tracking-tight text-primary tabular-nums">
                <CountUp value={value} />
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
