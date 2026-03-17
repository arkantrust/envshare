"use client";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";

import { ErrorMessage } from "@/components/error";
import { Title } from "@/components/title";
import { decodeCompositeKey } from "@/pkg/encoding";
import { decrypt } from "@/pkg/encryption";

export default function Unseal() {
  const [compositeKey, setCompositeKey] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCompositeKey(window.location.hash.replace(/^#/, ""));
    }
  }, []);

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remainingReads, setRemainingReads] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = async () => {
    try {
      setError(null);
      setText(null);
      setLoading(true);

      if (!compositeKey) {
        throw new Error("No id provided");
      }

      const { id, encryptionKey, version } = decodeCompositeKey(compositeKey);
      const res = await fetch(`/api/v1/load?id=${id}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const json = (await res.json()) as {
        iv: string;
        encrypted: string;
        remainingReads: number | null;
      };
      setRemainingReads(json.remainingReads);

      const decrypted = await decrypt(json.encrypted, encryptionKey, json.iv, version);

      setText(decrypted);
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
      {text ? (
        <div className="mx-auto max-w-4xl">
          {remainingReads !== null ? (
            <div className="text-center text-sm text-zinc-600">
              {remainingReads > 0 ? (
                <p>
                  This document can be read <span className="text-zinc-100">{remainingReads}</span>{" "}
                  more times.
                </p>
              ) : (
                <p className="text-zinc-400">
                  This was the last time this document could be read. It was deleted from storage.
                </p>
              )}
            </div>
          ) : null}
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
              <div>
                <pre className="flex overflow-x-auto">
                  <code className="px-4 text-left">{text}</code>
                </pre>
              </div>
            </div>
          </pre>

          <div className="mt-4 flex items-center justify-end gap-4">
            <Link
              href="/share"
              type="button"
              className="relative -ml-px inline-flex items-center space-x-2 rounded-sm border border-zinc-300/40 px-4 py-2 text-sm font-medium text-zinc-300 duration-150 hover:border-zinc-300 hover:text-white focus:outline-hidden"
            >
              Share another
            </Link>
            <button
              type="button"
              className="hover relative -ml-px inline-flex items-center space-x-2 rounded-sm border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 duration-150 hover:bg-zinc-900 hover:text-zinc-50 focus:border-zinc-500 focus:outline-hidden"
              onClick={() => {
                navigator.clipboard.writeText(text);
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
          className="mx-auto max-w-3xl "
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Title>Decrypt a document</Title>

          <div className="mt-8 rounded-sm border border-zinc-600 px-3 py-2 focus-within:border-zinc-100/80 focus-within:ring-0 ">
            <label htmlFor="id" className="block text-xs font-medium text-zinc-100">
              ID
            </label>
            <input
              type="text"
              name="compositeKey"
              id="compositeKey"
              className="w-full appearance-none border-0 bg-transparent p-0 text-base text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
              value={compositeKey}
              onChange={(e) => setCompositeKey(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-8 inline-flex h-12 w-full items-center justify-center  rounded  bg-zinc-200 px-4 py-1.5 text-base leading-7 font-semibold text-zinc-800 ring-1   transition-all duration-150  hover:bg-white  hover:text-black hover:drop-shadow-cta   md:py-2 ${
              loading ? "animate-pulse" : ""
            }`}
          >
            <span>{loading ? <Cog6ToothIcon className="h-5 w-5 animate-spin" /> : "Unseal"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
