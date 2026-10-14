"use client";
import { TriangleAlertIcon } from "lucide-react";
import { useMemo, useRef } from "react";

import { Textarea } from "@/components/ui/textarea";
import { tokenize } from "@/lib/dotenv";
import { cn } from "@/lib/utils";

const MIN_LINES = 8;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  dragging?: boolean;
  id?: string;
};

/**
 * A plain textarea with a syntax-highlighted overlay rendered underneath it.
 * The textarea text is transparent, so the overlay shows through; both use identical metrics.
 */
export function EnvEditor({ value, onChange, onSubmit, dragging, id }: Props) {
  const overlay = useRef<HTMLPreElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const tokens = useMemo(() => tokenize(value), [value]);
  const invalid = tokens.filter((t) => t.type === "invalid").length;
  const lines = Math.max(MIN_LINES, tokens.length);

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => textarea.current?.focus()}
        className={cn(
          "flex cursor-text items-start rounded-md border bg-muted/20 px-3 py-3 font-mono text-sm leading-6 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          dragging && "border-primary bg-primary/10",
        )}
      >
        <div aria-hidden="true" className="pr-3 text-right text-muted-foreground/50 select-none">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className={cn(tokens[i]?.type === "invalid" && "text-amber-500")}>
              {(i + 1).toString().padStart(2, "0")}
            </div>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <pre
            ref={overlay}
            aria-hidden="true"
            style={{ minHeight: `${lines * 1.5}rem` }}
            className="pointer-events-none relative overflow-hidden font-mono text-sm leading-6 whitespace-pre"
          >
            {tokens.map((t, i) => (
              <div key={i} className="min-h-6">
                {t.type === "comment" ? (
                  <span className="text-muted-foreground/60">{t.raw}</span>
                ) : t.type === "pair" ? (
                  <>
                    <span className="text-muted-foreground">{t.prefix}</span>
                    <span className="text-primary">{t.key}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-foreground/80">{t.value}</span>
                  </>
                ) : t.type === "invalid" ? (
                  <span className="text-amber-500 underline decoration-wavy underline-offset-4">
                    {t.raw}
                  </span>
                ) : (
                  <span className="text-foreground/80">{t.raw}</span>
                )}
              </div>
            ))}
          </pre>
          <Textarea
            ref={textarea}
            id={id}
            name="text"
            aria-label="Environment variables"
            wrap="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={(e) => {
              if (overlay.current) {
                overlay.current.scrollLeft = e.currentTarget.scrollLeft;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSubmit?.();
              }
            }}
            spellCheck={false}
            placeholder="DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres"
            className="absolute inset-0 field-sizing-fixed h-full min-h-0 w-full resize-none overflow-x-auto rounded-none border-0 bg-transparent p-0 font-mono text-sm leading-6 whitespace-pre text-transparent caret-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
      </div>
      {invalid > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-500">
          <TriangleAlertIcon className="size-3.5" />
          {invalid} {invalid === 1 ? "line doesn't" : "lines don't"} look like KEY=VALUE. You can
          still share it.
        </p>
      ) : null}
    </div>
  );
}
