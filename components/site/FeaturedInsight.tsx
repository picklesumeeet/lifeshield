import { Award } from "lucide-react";
import { brand } from "@/lib/brand";

export function FeaturedInsight() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4">
      <div className="rounded-3xl bg-cream border border-ink-300/30 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-mint-600 mb-3">
            Featured Insight
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-mint-900 leading-tight max-w-xl">
            {brand.name} Named One of America&apos;s Best Insurance Companies for 2026
          </h3>
          <p className="mt-3 text-ink-500 max-w-lg">
            Recognized for affordability, transparency, and customer satisfaction
            in the annual industry review.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-ink-900 text-white px-6 py-6 text-center min-w-[180px]">
          <div className="font-display text-xs uppercase tracking-widest text-mint-300 mb-2 flex items-center justify-center gap-1.5">
            <Award size={14} /> Awarded
          </div>
          <div className="font-display text-3xl font-bold text-white leading-none">
            2026
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-widest text-mint-200 leading-tight">
            America&apos;s Best<br />Insurance Companies
          </div>
        </div>
      </div>
    </section>
  );
}
