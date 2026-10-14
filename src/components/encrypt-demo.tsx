"use client";
import { LockIcon, LockOpenIcon } from "lucide-react";
import { useEffect, useState } from "react";

const PLAIN = "DATABASE_URL=postgres://admin:s3cr3t@db.internal:5432/app";
const CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

/** Loops a line of plaintext turning into ciphertext and back. Static when reduced motion is on. */
export function EncryptDemo() {
  const [progress, setProgress] = useState(0); // 0 = plaintext, 1 = ciphertext
  const [, tick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    // Phases (ms): hold plaintext, scramble to ciphertext, hold, scramble back.
    const HOLD = 1800;
    const SWEEP = 1200;
    const cycle = 2 * (HOLD + SWEEP);
    const start = performance.now();
    const id = setInterval(() => {
      const t = (performance.now() - start) % cycle;
      let p: number;
      if (t < HOLD) p = 0;
      else if (t < HOLD + SWEEP) p = (t - HOLD) / SWEEP;
      else if (t < 2 * HOLD + SWEEP) p = 1;
      else p = 1 - (t - 2 * HOLD - SWEEP) / SWEEP;
      setProgress(p);
      tick((n) => n + 1);
    }, 60);
    return () => clearInterval(id);
  }, [reduced]);

  const shown = reduced ? 0 : progress;
  const encrypted = shown > 0.5;
  const line = PLAIN.split("")
    .map((c, i) => (i / PLAIN.length < shown ? randomChar() : c))
    .join("");

  return (
    <div
      className="mx-auto w-full max-w-xl rounded-lg border bg-card/60 text-left shadow-lg backdrop-blur"
      role="img"
      aria-label="A line of plaintext environment variables being encrypted in the browser"
    >
      <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-2">.env</span>
        <span className="ml-auto flex items-center gap-1.5 text-primary">
          {encrypted ? <LockIcon className="size-3.5" /> : <LockOpenIcon className="size-3.5" />}
          {encrypted ? "encrypted" : "plaintext"}
        </span>
      </div>
      <pre
        aria-hidden="true"
        className="overflow-hidden px-4 py-4 font-mono text-xs leading-6 break-all whitespace-pre-wrap sm:text-sm"
      >
        <span className={encrypted ? "text-primary" : "text-foreground"}>{line}</span>
      </pre>
    </div>
  );
}
