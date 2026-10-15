/** Markup that has already been escaped or authored by us. */
export class Html {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

type Part = string | number | Html | null | undefined | false | Part[];

function render(part: Part): string {
  if (part === null || part === undefined || part === false) return "";
  if (Array.isArray(part)) return part.map(render).join("");
  if (part instanceof Html) return part.value;
  return escapeHtml(String(part));
}

/**
 * Tagged template for email markup: every interpolation is escaped unless it
 * is itself `html`, so repo names and descriptions can never inject markup.
 */
export function html(strings: TemplateStringsArray, ...parts: Part[]) {
  return new Html(
    strings.reduce((out, s, i) => out + s + (i < parts.length ? render(parts[i]) : ""), ""),
  );
}
