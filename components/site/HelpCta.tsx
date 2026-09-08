import { brand } from "@/lib/brand";
import { CtaLink } from "@/components/site/CtaLink";

export function HelpCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-ink-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,var(--mint-700),transparent_60%)]" />
        <div className="relative grid md:grid-cols-2 items-center gap-8 px-6 py-12 md:px-14 md:py-16">
          <div>
            <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              Still need help?
            </h3>
            <p className="mt-3 text-mint-100/80 max-w-md">
              Get your life insurance quote online or call one of our licensed
              agents at
            </p>
            <a
              href={brand.phoneHref}
              className="mt-2 inline-block font-display text-2xl md:text-3xl font-bold text-white hover:text-mint-200 transition-colors"
            >
              {brand.phone}
            </a>
            <div className="mt-6">
              <CtaLink
                href="/quotefc"
                className="inline-flex items-center justify-center rounded-full bg-white text-ink-900 font-semibold px-7 py-3.5 hover:bg-mint-50 transition-colors shadow-md"
              >
                Get Started
              </CtaLink>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="aspect-[4/3] w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80&auto=format&fit=crop"
                alt="Friendly agents"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
