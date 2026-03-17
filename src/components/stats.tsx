import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
export const revalidate = 60;

export async function Stats() {
  const [reads, writes] = await redis
    .pipeline()
    .get("envshare:metrics:reads")
    .get("envshare:metrics:writes")
    .exec<[number, number]>();
  const stars = await fetch("https://api.github.com/repos/chronark/envshare")
    .then((res) => res.json())
    .then((json) => json.stargazers_count as number);

  const stats = [
    {
      label: "Documents Encrypted",
      value: writes,
    },
    {
      label: "Documents Decrypted",
      value: reads,
    },
  ] satisfies { label: string; value: number }[];

  if (stars) {
    stats.push({
      label: "GitHub Stars",
      value: stars,
    });
  }

  return (
    <section className="container mx-auto">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
        {stats.map(({ label, value }) => (
          <li
            key={label}
            className="m flex items-center justify-between gap-2 overflow-hidden rounded-sm px-4 py-3 sm:flex-col"
          >
            <dd className="text-center text-2xl font-bold tracking-tight text-zinc-200 sm:text-5xl">
              {Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
            </dd>
            <dt className="text-center leading-6 text-zinc-500">{label}</dt>
          </li>
        ))}
      </ul>
    </section>
  );
}
