import { ImageResponse } from "next/og";
import { PALETTE, ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fonts = await ogFonts("JNF");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.cloth,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 132,
          height: 132,
          borderRadius: 66,
          border: `9px solid ${PALETTE.onCloth}`,
          fontFamily: "Display",
          fontSize: 52,
          letterSpacing: 2,
          color: PALETTE.onCloth,
        }}
      >
        JNF
      </div>
    </div>,
    { ...size, fonts },
  );
}
