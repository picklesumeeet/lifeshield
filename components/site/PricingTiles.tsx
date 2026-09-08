import { cn } from "@/lib/utils";
import { CtaLink } from "@/components/site/CtaLink";
import { brand } from "@/lib/brand";

const tiers = [
  {
    term: "10 Years",
    price: "$15.66",
    coverage: "$250k",
    accent: "mint",
    featured: false,
  },
  {
    term: "20 Years",
    price: "$30.02",
    coverage: "$500k",
    accent: "mint-dark",
    featured: true,
  },
  {
    term: "30 Years",
    price: "$43.07",
    coverage: "$500k",
    accent: "mint-light",
    featured: false,
  },
] as const;

export function PricingTiles() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-mint-900 tracking-tight">
          A plan for every stage of life
        </h2>
        <p className="mt-4 text-lg text-ink-500">
          {brand.name} offers a range of policies and coverage terms at a low
          monthly premium. Rates below are for a 30-year-old in good health.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.term}
            className={cn(
              "relative rounded-3xl bg-white p-8 shadow-sm border transition-all hover:shadow-lg hover:-translate-y-0.5",
              tier.featured ? "border-ink-900 ring-1 ring-ink-900/40" : "border-ink-300/20",
            )}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 text-white text-xs font-semibold px-3 py-1 shadow">
                Most popular
              </div>
            )}
            <div
              className={cn(
                "inline-block rounded-full text-xs font-bold uppercase tracking-wider px-3 py-1.5",
                tier.accent === "mint-dark" && "bg-mint-700 text-white",
                tier.accent === "mint" && "bg-mint-500 text-white",
                tier.accent === "mint-light" && "bg-mint-100 text-mint-800",
              )}
            >
              {tier.term}
            </div>
            <div className="mt-6 font-display text-xl font-semibold text-mint-800">
              MintChoice<span className="font-light">® Term</span>
            </div>
            <div className="mt-6 pb-5 border-b border-ink-300/20">
              <div className="text-xs uppercase text-ink-500 tracking-wider">
                Starting at
              </div>
              <div className="text-4xl font-bold text-ink-900 mt-1">
                {tier.price}
                <span className="text-base font-medium text-ink-500 ml-1">
                  /mo
                </span>
              </div>
            </div>
            <div className="pt-5">
              <div className="text-xs uppercase text-ink-500 tracking-wider">
                Up to
              </div>
              <div className="text-4xl font-bold text-ink-900 mt-1">
                {tier.coverage}
                <span className="text-base font-medium text-ink-500 ml-1">
                  coverage
                </span>
              </div>
            </div>
            <CtaLink
              href="/quotefc"
              className="mt-8 flex items-center justify-center rounded-full bg-ink-900 hover:bg-ink-700 text-white font-semibold py-3 transition-colors"
            >
              Get My Quote
            </CtaLink>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-500 text-center mt-8 max-w-2xl mx-auto">
        *Rates are illustrative and based on a 30-year-old female in good health.
        Your actual premium depends on age, health, and other underwriting factors.
      </p>
    </section>
  );
}
