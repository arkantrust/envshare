export type EnvToken =
  | { type: "blank"; raw: string }
  | { type: "comment"; raw: string }
  | { type: "pair"; raw: string; prefix: string; key: string; value: string }
  | { type: "continuation"; raw: string }
  | { type: "invalid"; raw: string };

const PAIR = /^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_.-]*)\s*=(.*)$/;

/** Returns the quote character if the value opens a quote that is not closed on the same line. */
function openQuote(value: string): string | null {
  const v = value.trimStart();
  const q = v[0];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  return v.indexOf(q, 1) === -1 ? q : null;
}

/** Tokenizes a .env document line by line, tracking multi-line quoted values. */
export function tokenize(text: string): EnvToken[] {
  const tokens: EnvToken[] = [];
  let quote: string | null = null;

  for (const line of text.split("\n")) {
    if (quote) {
      tokens.push({ type: "continuation", raw: line });
      if (line.includes(quote)) quote = null;
      continue;
    }
    if (line.trim() === "") {
      tokens.push({ type: "blank", raw: line });
    } else if (line.trimStart().startsWith("#")) {
      tokens.push({ type: "comment", raw: line });
    } else {
      const m = PAIR.exec(line);
      if (m) {
        tokens.push({ type: "pair", raw: line, prefix: m[1], key: m[2], value: m[3] });
        quote = openQuote(m[3]);
      } else {
        tokens.push({ type: "invalid", raw: line });
      }
    }
  }
  return tokens;
}
