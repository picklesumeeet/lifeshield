"use client";

import Link from "next/link";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

function SocialIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.89 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .78 0 1.73v20.53C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.74V1.73C24 .78 23.21 0 22.23 0z",
  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  facebook:
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z",
};

const columns = [
  {
    title: "Life Insurance",
    links: ["Term Life", "Whole Life", "Final Expense", "Compare Plans"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Newsroom", "Contact"],
  },
  {
    title: "Resources",
    links: ["Blog", "Calculator", "Glossary", "FAQs"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "TCPA Consent", "Accessibility"],
  },
];

export function Footer() {
  const router = useRouter();
  const [zip, setZip] = useState("");

  return (
    <footer className="bg-ink-900 text-mint-50 mt-8">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-8">
        <div className="grid md:grid-cols-[2fr_3fr] gap-10 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-display font-bold text-white">{brand.wordmark.primary}</span>
              <span className="text-3xl font-display font-light text-mint-400">{brand.wordmark.secondary}</span>
            </div>
            <p className="text-sm text-mint-100/70 max-w-md">
              Get your quote in minutes.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (zip.trim())
                  router.push(`/quotefc${window.location.search}`);
              }}
              className="mt-5 flex gap-2 max-w-md"
            >
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                placeholder="Zip Code"
                className="flex-1 rounded-full bg-white text-ink-900 placeholder-ink-500 px-5 py-3 outline-none focus:ring-2 focus:ring-mint-400"
              />
              <button
                type="submit"
                className="rounded-full bg-white hover:bg-mint-50 text-ink-900 font-semibold px-5 py-3 flex items-center gap-1 transition-colors"
              >
                Get My Quote <ArrowRight size={16} />
              </button>
            </form>
            <div className="mt-6 flex gap-3">
              <a href={brand.socials.linkedin} className="rounded-full bg-white/10 hover:bg-mint-500 p-2.5 transition-colors" aria-label="LinkedIn">
                <SocialIcon path={ICONS.linkedin} />
              </a>
              <a href={brand.socials.instagram} className="rounded-full bg-white/10 hover:bg-mint-500 p-2.5 transition-colors" aria-label="Instagram">
                <SocialIcon path={ICONS.instagram} />
              </a>
              <a href={brand.socials.facebook} className="rounded-full bg-white/10 hover:bg-mint-500 p-2.5 transition-colors" aria-label="Facebook">
                <SocialIcon path={ICONS.facebook} />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-semibold text-white mb-3 text-sm">
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-sm text-mint-100/70 hover:text-white transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-mint-100/60">
          <div>© {new Date().getFullYear()} {brand.name}. All rights reserved.</div>
          <div>{brand.address}</div>
        </div>
      </div>
    </footer>
  );
}
