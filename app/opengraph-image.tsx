import { ImageResponse } from "next/og";
import { OG_SIZE, OgStamp, PALETTE, ogFonts } from "@/lib/og";

export const alt = "Job Not Finished: your side projects are overdue.";
export const size = OG_SIZE;
export const contentType = "image/png";

const DATES = ["MAR 14 2024", "APR 02 2024", "APR 29 2024", "JUN 19 2024", "AUG 03 2024"];
const HEADLINE = "Your side projects are overdue.";
const FOOT = "JOB NOT FINISHED · FREE AND OPEN SOURCE";

export default async function Image() {
  const fonts = await ogFonts(`${HEADLINE.toUpperCase()}${FOOT}DATE DUE${DATES.join("")}OVERDUE`);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 72px",
        background: PALETTE.cloth,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: 380,
          height: 500,
          padding: "30px 30px 0",
          background: PALETTE.card,
          borderRadius: 4,
          transform: "rotate(-2deg)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontFamily: "Typed",
            fontSize: 32,
            letterSpacing: 10,
            color: PALETTE.ink,
          }}
        >
          DATE DUE
        </div>
        <div
          style={{
            display: "flex",
            height: 7,
            marginTop: 8,
            borderTop: `2px solid ${PALETTE.red}`,
            borderBottom: `2px solid ${PALETTE.red}`,
          }}
        />
        {DATES.map((date, i) => (
          <div
            key={date}
            style={{
              display: "flex",
              height: 64,
              alignItems: "center",
              paddingLeft: 10 + ((i * 17) % 30),
              borderBottom: `2px solid ${PALETTE.rule}`,
              fontFamily: "Display",
              fontSize: 34,
              letterSpacing: 2,
              color: PALETTE.violet,
              opacity: 0.85,
            }}
          >
            {date}
          </div>
        ))}
        <OgStamp
          color={PALETTE.red}
          size={76}
          rotate={-14}
          style={{ position: "absolute", left: 34, top: 330 }}
        >
          Overdue
        </OgStamp>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Display",
            fontSize: 112,
            lineHeight: 0.9,
            textTransform: "uppercase",
            color: PALETTE.onCloth,
          }}
        >
          {HEADLINE}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontFamily: "Typed",
            fontSize: 20,
            letterSpacing: 2,
            color: PALETTE.onClothMuted,
          }}
        >
          {FOOT}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
