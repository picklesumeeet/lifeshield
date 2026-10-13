"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/site/Header";

const HOST =
  process.env.NEXT_PUBLIC_CQ_HOST ?? "https://funnel.savvy-marketing.io";
const VARIANT = process.env.NEXT_PUBLIC_CQ_VARIANT ?? "c";

export default function QuoteFcPage() {
  const holderRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    let search = window.location.search;
    if (!search && document.referrer) {
      try {
        search = new URL(document.referrer).search;
      } catch {}
    }

    const frame = document.createElement("iframe");
    const q = new URLSearchParams(search);
    q.delete("variant");
    q.set("lander", window.location.hostname + window.location.pathname);
    frame.src = `${HOST}/embed/${VARIANT}?${q.toString()}`;
    frame.title = "Get your life insurance quote";
    frame.loading = "eager";
    frame.style.cssText = "width:100%;border:0;display:block;height:720px";
    frame.setAttribute("allow", "clipboard-write");

    const onLoad = () => setLoaded(true);
    frame.addEventListener("load", onLoad);
    holder.appendChild(frame);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (
        data &&
        data.type === "cq:height" &&
        typeof data.height === "number" &&
        data.height > 200
      ) {
        frame.style.height = data.height + "px";
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      frame.removeEventListener("load", onLoad);
      holder.removeChild(frame);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="funnel" />
      <main className="flex-1 bg-cream py-6">
        <div
          id="cq-form-c"
          ref={holderRef}
          style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}
        >
          {!loaded && <QuoteSkeleton />}
        </div>
      </main>
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your quote form"
      className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm animate-pulse"
      style={{ minHeight: 720 }}
    >
      <div className="h-7 bg-mint-100 rounded w-2/3 mb-3" />
      <div className="h-4 bg-mint-100 rounded w-1/2 mb-8" />
      <div className="space-y-4">
        <div className="h-12 bg-mint-100 rounded-lg" />
        <div className="h-12 bg-mint-100 rounded-lg" />
        <div className="h-12 bg-mint-100 rounded-lg" />
        <div className="h-12 bg-mint-100 rounded-lg" />
      </div>
      <div className="h-12 bg-mint-200 rounded-full mt-10 w-full" />
      <p className="sr-only">Loading your quote form…</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PREVIOUS IMPLEMENTATION — full-viewport iframe pointed at /embed?variant=…
// Kept here for quick rollback. Delete once the new "look C" is confirmed.
// -----------------------------------------------------------------------------
//
// import { useEffect, useRef, useState } from "react";
// import { Header } from "@/components/site/Header";
//
// const HOST =
//   process.env.NEXT_PUBLIC_CQ_HOST ?? "https://funnel.savvy-marketing.io";
// const VARIANT = process.env.NEXT_PUBLIC_CQ_VARIANT ?? "";
//
// export default function QuoteFcPage() {
//   const frameRef = useRef<HTMLIFrameElement>(null);
//   const [src, setSrc] = useState<string | null>(null);
//
//   useEffect(() => {
//     let search = window.location.search;
//     if (!search && document.referrer) {
//       try {
//         search = new URL(document.referrer).search;
//       } catch {}
//     }
//     const q = new URLSearchParams(search);
//     if (VARIANT) q.set("variant", VARIANT);
//     q.set("lander", window.location.hostname + window.location.pathname);
//     setSrc(`${HOST}/embed?${q.toString()}`);
//   }, []);
//
//   return (
//     <div className="h-screen flex flex-col">
//       <Header variant="funnel" />
//       <main className="flex-1 min-h-0 overflow-hidden bg-cream">
//         {src && (
//           <iframe
//             ref={frameRef}
//             src={src}
//             title="Get your life insurance quote"
//             loading="eager"
//             allow="clipboard-write"
//             className="block h-full w-full border-0"
//           />
//         )}
//       </main>
//     </div>
//   );
// }
