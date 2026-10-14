"use client";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCopy } from "@/hooks/use-copy";
import { decodeCompositeKey } from "@/pkg/encoding";
import { decrypt } from "@/pkg/encryption";

/** Accepts a full link (…/unseal#key), a bare key, or a legacy /key path. */
function extractKey(input: string): string {
  const value = input.trim();
  if (!value) return "";
  const hash = value.indexOf("#");
  if (hash !== -1) return value.slice(hash + 1);
  return value.split("/").filter(Boolean).pop() ?? "";
}

function download(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = ".env";
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [revealed, setRevealed] = useState(true);
  const [error, setError] = useState<{ title: string; description: string } | null>(null);
  const { copied, copy } = useCopy();

  const onSubmit = async () => {
    try {
      setText(null);
      setError(null);
      setLoading(true);

      const key = extractKey(compositeKey);
      if (!key) {
        throw new Error("Paste the link or ID of the document you want to decrypt.");
      }

      const { id, encryptionKey, version } = decodeCompositeKey(key);
      const res = await fetch(`/api/v1/load?id=${id}`);
      if (res.status === 404) {
        setError({
          title: "Document not found",
          description:
            "It may have expired, reached its read limit and been deleted, or the link is incorrect.",
        });
        return;
      }
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
      setError({ title: "Could not decrypt", description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
      {text ? (
        <div className="flex flex-col gap-4">
          {remainingReads !== null ? (
            <p className="text-center text-sm text-muted-foreground">
              {remainingReads > 0 ? (
                <>
                  This document can be read{" "}
                  <span className="font-semibold text-primary">{remainingReads}</span> more{" "}
                  {remainingReads === 1 ? "time" : "times"}.
                </>
              ) : (
                "This was the last time this document could be read. It was deleted from storage."
              )}
            </p>
          ) : null}
          <div className="flex items-start overflow-x-auto rounded-md border bg-muted/20 px-3 py-3 font-mono text-sm leading-6">
            <div
              aria-hidden="true"
              className="pr-3 text-right text-muted-foreground/50 select-none"
            >
              {Array.from({ length: text.split("\n").length }).map((_, index) => (
                <Fragment key={index}>
                  {(index + 1).toString().padStart(2, "0")}
                  <br />
                </Fragment>
              ))}
            </div>
            <pre className="flex-1">
              <code className={revealed ? "" : "blur-sm select-none"}>{text}</code>
            </pre>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
              Share another
            </Button>
            <Button variant="outline" onClick={() => setRevealed((r) => !r)}>
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
              {revealed ? "Hide" : "Reveal"}
            </Button>
            <Button variant="outline" onClick={() => download(text)}>
              <DownloadIcon />
              Download .env
            </Button>
            <Button onClick={() => copy(text)}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Decrypt a document</CardTitle>
            <CardDescription>Paste the full link or its ID to unseal the document.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              {error ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.description}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="compositeKey">Link or ID</Label>
                <Input
                  type="text"
                  name="compositeKey"
                  id="compositeKey"
                  autoComplete="off"
                  spellCheck={false}
                  value={compositeKey}
                  onChange={(e) => setCompositeKey(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-11 text-base" disabled={loading}>
                {loading ? <Loader2Icon className="animate-spin" /> : null}
                {loading ? "Decrypting…" : "Unseal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
