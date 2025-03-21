import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Not Finished",
  description: "A Wake up call for unfinished projects",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://job-not-finished.vercel.app/",
    images: [
      {
        url: "https://raw.githubusercontent.com/user-64bit/job-not-finished/refs/heads/main/public/image.png",
        width: 1200,
        height: 630,
        alt: "Job Not Finished",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
