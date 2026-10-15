import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Courier_Prime, Public_Sans } from "next/font/google";
import { appUrl } from "@/lib/env";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
  // next/font has no metrics for it to size a fallback against.
  adjustFontFallback: false,
  fallback: ["Avenir Next Condensed", "Arial Narrow", "Roboto Condensed", "sans-serif"],
});
const typed = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier-prime",
});
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });

const description =
  "Your side projects are overdue. Job Not Finished reads your public GitHub repos and mails you a weekly roast built from your real commit history until you ship. Free and open source.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Job Not Finished", template: "%s · Job Not Finished" },
  description,
  applicationName: "Job Not Finished",
  openGraph: { type: "website", siteName: "Job Not Finished", description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c4a3a" },
    { media: "(prefers-color-scheme: dark)", color: "#11291f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${typed.variable} ${sans.variable}`}>
      <body>
        {/* Shared rubber-stamp ink: edge wobble plus speckle where the pad ran dry. */}
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id="rubber" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed="4"
              result="wobble"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="wobble"
              scale="2.4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="edges"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.4"
              numOctaves="1"
              seed="11"
              result="speck"
            />
            <feColorMatrix
              in="speck"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.05"
              result="dry"
            />
            <feComposite in="edges" in2="dry" operator="in" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
