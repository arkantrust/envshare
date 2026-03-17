"use client";
import {
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useState, Fragment } from "react";

import { ErrorMessage } from "@/components/error";
import { Title } from "@/components/title";
import { LATEST_KEY_VERSION } from "@/pkg/constants";
import { encodeCompositeKey } from "@/pkg/encoding";
import { encrypt } from "@/pkg/encryption";
import { toBase58 } from "@/util/base58";

export default function Home() {
  const [text, setText] = useState("");
  const [reads, setReads] = useState(999);

  const [ttl, setTtl] = useState(7);
  const [ttlMultiplier, setTtlMultiplier] = useState(60 * 60 * 24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [link, setLink] = useState("");

  const onSubmit = async () => {
    try {
      setError("");
      setLink("");
      setLoading(true);

      const { encrypted, iv, key } = await encrypt(text);

      const { id } = (await fetch("/api/v1/store", {
        method: "POST",
        body: JSON.stringify({
          ttl: ttl * ttlMultiplier,
          reads,
          encrypted: toBase58(encrypted),
          iv: toBase58(iv),
        }),
      }).then((r) => r.json())) as { id: string };

      const compositeKey = encodeCompositeKey(LATEST_KEY_VERSION, id, key);

      const url = new URL(window.location.href);
      url.pathname = "/unseal";
      url.hash = compositeKey;
      setCopied(false);
      setLink(url.toString());
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-16 px-8 lg:mt-32 ">
      {error ? <ErrorMessage message={error} /> : null}

      {link ? (
        <div className="mt-8 flex h-full w-full flex-col items-center justify-center md:mt-16 xl:mt-32">
          <Title>Share this link with others</Title>
          <div className="relative mt-16 flex grow items-stretch focus-within:z-10">
            <pre className="font-mono rounded-sm border border-zinc-600 bg-transparent px-4 py-3 text-center text-zinc-100 focus:border-zinc-100/80 focus:ring-0 sm:text-sm">
              {link}
            </pre>
            <button
              type="button"
              className="hover relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 duration-150 hover:bg-white hover:text-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-hidden"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? (
                <ClipboardDocumentCheckIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />
              )}{" "}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mx-auto max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.length <= 0) return;
            onSubmit();
          }}
        >
          <Title>Encrypt and Share</Title>

          <pre className="font-mono mt-8 rounded-sm border border-zinc-600 bg-transparent px-4 py-3 text-left text-zinc-100 focus:border-zinc-100/80 focus:ring-0 sm:text-sm">
            <div className="flex items-start px-1 text-sm">
              <div
                aria-hidden="true"
                className="font-mono border-r border-zinc-300/5 pr-4 text-zinc-700 select-none"
              >
                {Array.from({
                  length: text.split("\n").length,
                }).map((_, index) => (
                  <Fragment key={index}>
                    {(index + 1).toString().padStart(2, "0")}
                    <br />
                  </Fragment>
                ))}
              </div>

              <textarea
                id="text"
                name="text"
                value={text}
                minLength={1}
                onChange={(e) => setText(e.target.value)}
                rows={Math.max(5, text.split("\n").length)}
                placeholder="DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres"
                className="w-full resize-none appearance-none border-0 bg-transparent p-0 text-base text-zinc-100 placeholder-zinc-500 hover:resize focus:ring-0 sm:text-sm"
              />
            </div>
          </pre>

          <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="w-full sm:w-1/5">
              <label
                className="whitespace-no-wrap flex h-16 items-center justify-center rounded-sm border border-zinc-600 px-3 py-2 text-sm text-zinc-100 duration-150 hover:cursor-pointer hover:border-zinc-100/80 hover:text-white focus:border-zinc-100/80 focus:ring-0 "
                htmlFor="file_input"
              >
                Upload a file
              </label>
              <input
                className="hidden"
                id="file_input"
                type="file"
                onChange={(e) => {
                  const file = e.target.files![0];
                  if (file.size > 1024 * 16) {
                    setError("File size must be less than 16kb");
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const t = e.target!.result as string;
                    setText(t);
                  };
                  reader.readAsText(file);
                }}
              />
            </div>

            <div className="h-16 w-full rounded-sm border border-zinc-600 px-3 py-2 duration-150 focus-within:border-zinc-100/80 focus-within:ring-0 hover:border-zinc-100/80 sm:w-2/5 ">
              <label htmlFor="reads" className="block text-xs font-medium text-zinc-100">
                READS
              </label>
              <input
                type="number"
                name="reads"
                id="reads"
                className="w-full appearance-none border-0 bg-transparent p-0 text-base text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                value={reads}
                onChange={(e) => setReads(e.target.valueAsNumber)}
              />
            </div>
            <div className="relative h-16 w-full rounded-sm border border-zinc-600 px-3 py-2 duration-150 focus-within:border-zinc-100/80 focus-within:ring-0 hover:border-zinc-100/80 sm:w-2/5 ">
              <label htmlFor="reads" className="block text-xs font-medium text-zinc-100">
                TTL
              </label>
              <input
                type="number"
                name="reads"
                id="reads"
                className="w-full appearance-none border-0 bg-transparent p-0 text-base text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                value={ttl}
                onChange={(e) => setTtl(e.target.valueAsNumber)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {/* oxlint-disable-next-line jsx_a11y/label-has-associated-control */}
                <label htmlFor="ttlMultiplier" className="sr-only" />
                <select
                  id="ttlMultiplier"
                  name="ttlMultiplier"
                  className="h-full rounded-sm border-0 border-transparent bg-transparent py-0 pr-7 pl-2 text-zinc-500 focus:ring-0 sm:text-sm"
                  onChange={(e) => setTtlMultiplier(parseInt(e.target.value))}
                  defaultValue={60 * 60 * 24}
                >
                  <option value={60}>{ttl === 1 ? "Minute" : "Minutes"}</option>
                  <option value={60 * 60}>{ttl === 1 ? "Hour" : "Hours"}</option>
                  <option value={60 * 60 * 24}>{ttl === 1 ? "Day" : "Days"}</option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || text.length <= 0}
            className={`mt-6 inline-flex h-12 w-full items-center justify-center  rounded  bg-zinc-200 px-4 py-1.5 text-base leading-7 font-semibold ring-1    ring-transparent transition-all duration-150 md:py-2   ${
              text.length <= 0
                ? "cursor-not-allowed text-zinc-400"
                : "text-zinc-900 hover:bg-zinc-900/20 hover:text-zinc-100  hover:ring-zinc-600/80"
            } ${loading ? "animate-pulse" : ""}`}
          >
            <span>{loading ? <Cog6ToothIcon className="h-5 w-5 animate-spin" /> : "Share"}</span>
          </button>

          <div className="mt-8">
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <p>
                  <span className="font-semibold text-zinc-400">Reads:</span> The number of reads
                  determines how often the data can be shared, before it deletes itself. 0 means
                  unlimited.
                </p>
              </li>
              <li>
                <p>
                  <span className="font-semibold text-zinc-400">TTL:</span> You can add a TTL (time
                  to live) to the data, to automatically delete it after a certain amount of time. 0
                  means no TTL.
                </p>
              </li>
              <p>
                Clicking Share will generate a new symmetrical key and encrypt your data before
                sending only the encrypted data to the server.
              </p>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
}
