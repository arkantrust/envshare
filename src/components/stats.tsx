import { Redis } from "@upstash/redis";

import { CountUp } from "@/components/count-up";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

export async function Stats() {
  let reads = 0;
  let writes = 0;
  try {
    const redis = Redis.fromEnv();
    [reads, writes] = await redis
      .pipeline()
      .get("envshare:metrics:reads")
      .get("envshare:metrics:writes")
      .exec<[number, number]>();
  } catch (e) {
    console.error("Failed to load stats", e);
    return (
      <Card size="sm">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Usage stats are unavailable right now.
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Documents encrypted", value: writes ?? 0 },
    { label: "Documents decrypted", value: reads ?? 0 },
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
