import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { OG_SIZE, OgStamp, PALETTE, ogFonts } from "@/lib/og";
import { tally } from "@/lib/projects";

export const alt = "A Job Not Finished borrower record";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const user = await db.user.findFirst({
    where: { githubLogin: { equals: login, mode: "insensitive" }, publicProfile: true },
    select: {
      githubLogin: true,
      image: true,
      projects: {
        select: { status: true, dueAt: true, pushedAt: true, repoCreatedAt: true, isFork: true },
      },
    },
  });

  const handle = `@${user?.githubLogin ?? login}`.toUpperCase();
  const t = user ? tally(user.projects, new Date()) : null;
  const rows: [string, number][] = t
    ? [
        ["CHECKED OUT", t.onLoan + t.overdue],
        ["OVERDUE", t.overdue],
        ["RETURNED", t.returned],
        ["WITHDRAWN", t.withdrawn],
      ]
    : [];
  const verdict = !t
    ? "Not in the catalog"
    : t.overdue
      ? `${t.overdue} overdue`
      : "In good standing";
  const fonts = await ogFonts(
    `${handle}BORROWER'S RECORDJOB NOT FINISHED${rows.map(([l, n]) => `${l}${n}`).join("")}${verdict.toUpperCase()}.0123456789`,
  );

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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: 1000,
          height: 470,
          padding: "44px 56px",
          background: PALETTE.card,
          borderRadius: 4,
          boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
          fontFamily: "Typed",
          color: PALETTE.ink,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: PALETTE.inkMuted }}>
          BORROWER&apos;S RECORD · JOB NOT FINISHED
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 26 }}>
          {user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              width={104}
              height={104}
              style={{
                borderRadius: 4,
                border: `4px solid ${PALETTE.card}`,
                filter: "grayscale(1)",
              }}
            />
          )}
          <div style={{ display: "flex", fontSize: 58 }}>{handle}</div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 30, width: 520 }}
        >
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", fontSize: 28, alignItems: "flex-end" }}>
              <div style={{ display: "flex" }}>{label}</div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  margin: "0 12px 8px",
                  borderBottom: `3px dashed ${PALETTE.inkMuted}`,
                }}
              />
              <div style={{ display: "flex" }}>{value}</div>
            </div>
          ))}
        </div>
        <OgStamp
          color={t?.overdue ? PALETTE.red : PALETTE.violet}
          size={64}
          rotate={-8}
          style={{ position: "absolute", right: 64, bottom: 64 }}
        >
          {verdict}
        </OgStamp>
      </div>
    </div>,
    { ...size, fonts },
  );
}
