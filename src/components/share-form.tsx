"use client";
import {
  CheckIcon,
  CopyIcon,
  FlameIcon,
  Loader2Icon,
  MailIcon,
  Share2Icon,
  UploadIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { EnvEditor } from "@/components/env-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCopy } from "@/hooks/use-copy";
import { describeExpiry } from "@/lib/expiry";
import { LATEST_KEY_VERSION } from "@/pkg/constants";
import { encodeCompositeKey } from "@/pkg/encoding";
import { encrypt } from "@/pkg/encryption";
import { toBase58 } from "@/util/base58";

const MAX_FILE_SIZE = 1024 * 16;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const units = [
  { label: "Minutes", value: MINUTE },
  { label: "Hours", value: HOUR },
  { label: "Days", value: DAY },
];

const presets = [
  { label: "Burn after reading", reads: 1, ttl: 1, unit: DAY, icon: true },
  { label: "1 hour", reads: 0, ttl: 1, unit: HOUR },
  { label: "1 day", reads: 0, ttl: 1, unit: DAY },
  { label: "7 days", reads: 0, ttl: 7, unit: DAY },
];

type Result = { link: string; summary: string };

export function ShareForm() {
  const [text, setText] = useState("");
  const [reads, setReads] = useState(999);
  const [ttl, setTtl] = useState(7);
  const [ttlMultiplier, setTtlMultiplier] = useState(DAY);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [canShare, setCanShare] = useState(false);
  const { copied, copy } = useCopy();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const validInt = (n: number) => Number.isInteger(n) && n >= 0;
  const readsError = validInt(reads) ? null : "Enter a whole number, 0 or more.";
  const ttlError = validInt(ttl) ? null : "Enter a whole number, 0 or more.";
  const invalid = Boolean(readsError || ttlError);
  const ttlSeconds = validInt(ttl) ? ttl * ttlMultiplier : 0;
  const summary = invalid ? null : describeExpiry(reads, ttlSeconds);

  const readFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 16kb");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target!.result as string);
    reader.readAsText(file);
  };

  const submit = async () => {
    if (loading || invalid || text.length === 0) return;
    try {
      setLoading(true);
      const { encrypted, iv, key } = await encrypt(text);

      const res = await fetch("/api/v1/store", {
        method: "POST",
        body: JSON.stringify({
          ttl: ttlSeconds,
          reads,
          encrypted: toBase58(encrypted),
          iv: toBase58(iv),
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const { id } = (await res.json()) as { id: string };

      const url = new URL(window.location.href);
      url.pathname = "/unseal";
      url.search = "";
      url.hash = encodeCompositeKey(LATEST_KEY_VERSION, id, key);
      setResult({ link: url.toString(), summary: describeExpiry(reads, ttlSeconds) });
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const { link } = result;
    const mailto = `mailto:?subject=${encodeURIComponent("Secure document via EnvShare")}&body=${encodeURIComponent(
      `I shared some environment variables with you. Open this link to decrypt them:\n\n${link}\n\n${result.summary}`,
    )}`;
    return (
      <Card id="share" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl">Share this link with others</CardTitle>
          <CardDescription>
            The decryption key lives in the part after the #, which is never sent to the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-stretch gap-2">
            <pre className="min-w-0 flex-1 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm break-all whitespace-pre-wrap">
              {link}
            </pre>
            <Button size="lg" className="h-auto" onClick={() => copy(link)}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="rounded-md bg-white p-2">
              <QRCodeSVG value={link} size={112} marginSize={0} aria-label="QR code of the link" />
            </div>
            <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
              <p className="text-sm text-muted-foreground">{result.summary}</p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button variant="outline" nativeButton={false} render={<a href={mailto} />}>
                  <MailIcon />
                  Email
                </Button>
                {canShare ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigator
                        .share({
                          title: "EnvShare",
                          text: "Secure document via EnvShare",
                          url: link,
                        })
                        .catch(() => {})
                    }
                  >
                    <Share2Icon />
                    Share…
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="self-end"
            onClick={() => {
              setResult(null);
              setText("");
            }}
          >
            Share another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="share" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-xl">Encrypt and share</CardTitle>
        <CardDescription>
          Paste or type your variables, or drop a .env file. Encryption happens in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) readFile(file);
            }}
          >
            <EnvEditor
              id="text"
              value={text}
              onChange={setText}
              onSubmit={submit}
              dragging={dragging}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              or{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => fileInput.current?.click()}
              >
                <UploadIcon />
                upload a .env file
              </Button>
            </p>
            <input
              ref={fileInput}
              className="hidden"
              id="file_input"
              type="file"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFile(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reads">Reads</Label>
              <Input
                type="number"
                id="reads"
                name="reads"
                min={0}
                step={1}
                aria-invalid={Boolean(readsError)}
                aria-describedby="reads-error"
                value={Number.isNaN(reads) ? "" : reads}
                onChange={(e) => setReads(e.target.valueAsNumber)}
              />
              {readsError ? (
                <p id="reads-error" className="text-xs text-destructive">
                  {readsError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ttl">Expires after</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  id="ttl"
                  name="ttl"
                  min={0}
                  step={1}
                  aria-invalid={Boolean(ttlError)}
                  aria-describedby="ttl-error"
                  value={Number.isNaN(ttl) ? "" : ttl}
                  onChange={(e) => setTtl(e.target.valueAsNumber)}
                />
                <Select value={ttlMultiplier} onValueChange={(v) => setTtlMultiplier(v as number)}>
                  <SelectTrigger aria-label="TTL unit" className="w-28">
                    <SelectValue>
                      {(v: number) => units.find((u) => u.value === v)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ttlError ? (
                <p id="ttl-error" className="text-xs text-destructive">
                  {ttlError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Quick presets:</span>
              {presets.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setReads(p.reads);
                    setTtl(p.ttl);
                    setTtlMultiplier(p.unit);
                  }}
                >
                  {p.icon ? <FlameIcon className="text-primary" /> : null}
                  {p.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {summary ?? "Fix the highlighted fields to continue."}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 text-base"
            disabled={loading || invalid || !text}
          >
            {loading ? <Loader2Icon className="animate-spin" /> : null}
            {loading ? "Encrypting…" : "Share"}
            {!loading ? (
              <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1.5 text-xs font-normal opacity-70 sm:inline">
                Ctrl ↵
              </kbd>
            ) : null}
          </Button>

          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground/80">Reads:</span> how often the data
              can be read before it deletes itself. 0 means unlimited.
            </li>
            <li>
              <span className="font-semibold text-foreground/80">Expires after:</span> time to live
              before the data is deleted automatically. 0 means no expiry.
            </li>
          </ul>
        </form>
      </CardContent>
    </Card>
  );
}
