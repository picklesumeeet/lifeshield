"use client";

import { useEffect, useRef, useState } from "react";

const HOST =
  process.env.NEXT_PUBLIC_CQ_HOST ?? "https://funnel.savvy-marketing.io";
const VARIANT = process.env.NEXT_PUBLIC_CQ_VARIANT ?? "";

export function QuoteEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (VARIANT) q.set("variant", VARIANT);
    q.set("lander", window.location.hostname + window.location.pathname);
    setSrc(`${HOST}/embed?${q.toString()}`);

    function onMessage(e: MessageEvent) {
      const frame = frameRef.current;
      if (!frame || e.source !== frame.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | undefined;
      if (
        data?.type === "cq:height" &&
        typeof data.height === "number" &&
        data.height > 200
      ) {
        frame.style.height = `${data.height}px`;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section id="quote" className="mx-auto max-w-7xl px-6 pt-16 md:pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          Get your free quote
        </h2>
        <p className="mt-3 text-ink-500">
          Takes about a minute. No medical exam needed in most cases — a
          licensed agent follows up by phone.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-[680px]">
        {src && (
          <iframe
            ref={frameRef}
            src={src}
            title="Get your life insurance quote"
            loading="eager"
            allow="clipboard-write"
            style={{ width: "100%", border: 0, display: "block", height: 720 }}
          />
        )}
      </div>
    </section>
  );
}
