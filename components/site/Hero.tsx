import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-8 md:pt-14">
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-gradient-to-br from-mint-700 via-mint-600 to-mint-800 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center px-6 py-12 md:px-14 md:py-20">
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-mint-200 mb-4">
              Term life, made simple
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Affordable life insurance for everyday families.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-mint-50/90 leading-relaxed max-w-lg">
              Life insurance is easy, fast, and affordable with {brand.name}. Get
              your quote and buy term life online — no medical exam required in
              most cases.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#quote"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-mint-800 font-semibold px-7 py-3.5 hover:bg-mint-50 transition-colors shadow-md"
              >
                Get Started
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/30 text-white font-medium px-7 py-3.5 hover:bg-white/10 transition-colors"
              >
                See sample rates
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-mint-100/80">
              <div>
                <div className="text-2xl font-bold text-white">334k+</div>
                <div>Families protected</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">$96B</div>
                <div>In coverage delivered</div>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-mint-200/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/family.png"
                alt="Family together outdoors"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-6 rounded-2xl bg-white text-ink-900 shadow-xl px-5 py-4 max-w-[220px]">
              <div className="text-xs text-ink-500 uppercase tracking-wider">
                Starting at
              </div>
              <div className="text-2xl font-bold text-mint-800">
                $15.66<span className="text-sm font-medium text-ink-500">/mo</span>
              </div>
              <div className="text-xs text-ink-500">10-Year Term · $250k</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
