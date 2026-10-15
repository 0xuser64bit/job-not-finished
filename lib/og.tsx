import "server-only";

export const OG_SIZE = { width: 1200, height: 630 };

export const PALETTE = {
  cloth: "#1c4a3a",
  card: "#f5e9cd",
  onCloth: "#efe3c4",
  onClothMuted: "#a8c2b1",
  ink: "#1c1a15",
  inkMuted: "#51493a",
  violet: "#4333a6",
  red: "#b01e24",
  rule: "#a7bfdc",
};

/** A static TTF subset from Google Fonts (Satori can't read woff2). Cached per deployment. */
async function googleFont(family: string, weight: number, text: string) {
  const query = `family=${family.replaceAll(" ", "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?${query}`, { cache: "force-cache" })
  ).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`No TTF available for ${family}`);
  return (await fetch(src, { cache: "force-cache" })).arrayBuffer();
}

/** The two faces the cards use. Falls back to Satori's default face if Google is unreachable. */
export async function ogFonts(text: string) {
  try {
    const [display, typed] = await Promise.all([
      googleFont("Big Shoulders", 800, text),
      googleFont("Courier Prime", 700, text),
    ]);
    return [
      { name: "Display", data: display, weight: 800 as const, style: "normal" as const },
      { name: "Typed", data: typed, weight: 700 as const, style: "normal" as const },
    ];
  } catch (err) {
    console.warn("[og] font fetch failed, using the default face:", err);
    return [];
  }
}

/** A rubber stamp, Satori-style. */
export function OgStamp({
  children,
  color,
  size,
  rotate,
  style,
}: {
  children: string;
  color: string;
  size: number;
  rotate: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Display",
        fontSize: size,
        letterSpacing: size * 0.06,
        textTransform: "uppercase",
        color,
        border: `${Math.round(size * 0.11)}px solid ${color}`,
        borderRadius: size * 0.14,
        padding: `${size * 0.12}px ${size * 0.35}px ${size * 0.06}px`,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.88,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
