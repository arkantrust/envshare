import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Copies text to the clipboard, toasts, and resets `copied` after a short delay. */
export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), resetMs);
      } catch {
        toast.error("Could not copy to clipboard");
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
