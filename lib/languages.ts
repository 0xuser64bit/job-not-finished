// Genre stickers: GitHub's linguist colors for the languages people actually
// abandon side projects in. Anything else gets the plain sticker.
const COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Dart: "#00b4ab",
  Elixir: "#6e4a7e",
  Zig: "#ec915c",
  Lua: "#000080",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#663399",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  "Jupyter Notebook": "#da5b0b",
};

export const languageColor = (language: string | null) =>
  (language && COLORS[language]) || "#8a8170";
