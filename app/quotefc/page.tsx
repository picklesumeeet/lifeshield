"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/site/Header";

const HOST =
  process.env.NEXT_PUBLIC_CQ_HOST ?? "https://funnel.savvy-marketing.io";
const VARIANT = process.env.NEXT_PUBLIC_CQ_VARIANT ?? "";

export default function QuoteFcPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let search = window.location.search;
    if (!search && document.referrer) {
      try {
        search = new URL(document.referrer).search;
      } catch {}
    }
    const q = new URLSearchParams(search);
    if (VARIANT) q.set("variant", VARIANT);
    q.set("lander", window.location.hostname + window.location.pathname);
    setSrc(`${HOST}/embed?${q.toString()}`);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header variant="funnel" />
      <main className="flex-1 min-h-0 overflow-hidden bg-cream">
        {src && (
          <iframe
            ref={frameRef}
            src={src}
            title="Get your life insurance quote"
            loading="eager"
            allow="clipboard-write"
            className="block h-full w-full border-0"
          />
        )}
      </main>
    </div>
  );
}
