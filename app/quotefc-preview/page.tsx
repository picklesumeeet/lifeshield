"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/site/Header";

// Preview of the new "look C" iframe snippet the vendor sent. Renders under
// /quotefc-preview so it can be eyeballed without touching /quotefc.
export default function QuoteFcPreviewPage() {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    const HOST = "https://funnel.savvy-marketing.io";
    const VARIANT = "c";

    const frame = document.createElement("iframe");
    const q = new URLSearchParams(window.location.search);
    q.delete("variant");
    q.set("lander", window.location.hostname + window.location.pathname);
    frame.src = HOST + "/embed/" + VARIANT + "?" + q.toString();
    frame.title = "Get your life insurance quote";
    frame.loading = "eager";
    frame.style.cssText = "width:100%;border:0;display:block;height:720px";
    frame.setAttribute("allow", "clipboard-write");
    holder.appendChild(frame);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (data && data.type === "cq:height" && typeof data.height === "number" && data.height > 200) {
        frame.style.height = data.height + "px";
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      holder.removeChild(frame);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="funnel" />
      <main className="flex-1 bg-cream py-6">
        <div id="cq-form-c" ref={holderRef} style={{ maxWidth: 680, margin: "0 auto" }} />
      </main>
    </div>
  );
}
