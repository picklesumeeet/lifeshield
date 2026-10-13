import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const CQ_FUNNEL_HOST =
  process.env.NEXT_PUBLIC_CQ_HOST ?? "https://funnel.savvy-marketing.io";

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description:
    "Affordable term life insurance for everyday families. Get a personalized quote in minutes — no medical exam required in most cases.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        {/* Open the TLS connection to the funnel host as early as possible so
            the iframe on /quotefc isn't the first thing to pay for DNS + TLS. */}
        <link rel="preconnect" href={CQ_FUNNEL_HOST} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={CQ_FUNNEL_HOST} />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink-900">
        {children}
      </body>
    </html>
  );
}
