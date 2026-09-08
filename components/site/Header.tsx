import Link from "next/link";
import { brand } from "@/lib/brand";
import { CtaLink } from "@/components/site/CtaLink";

type Variant = "marketing" | "funnel";

export function Header({ variant = "marketing" }: { variant?: Variant } = {}) {
  return (
    <header className="w-full sticky top-0 z-40 bg-cream/90 backdrop-blur">
      <div className="border-b border-ink-300/30">
        <div className="mx-auto max-w-7xl px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-display font-bold tracking-tight text-mint-800">
              {brand.wordmark.primary}
            </span>
            <span className="text-2xl md:text-3xl font-display font-light tracking-tight text-mint-500">
              {brand.wordmark.secondary}
            </span>
          </Link>
          {variant === "funnel" ? (
            <span className="text-xs md:text-sm text-ink-500">
              Licensed agents · No medical exam to quote
            </span>
          ) : (
            <>
              <CtaLink
                href="/quotefc"
                className="hidden md:inline-flex rounded-full bg-ink-900 hover:bg-ink-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors shadow-sm"
              >
                Get My Quote
              </CtaLink>
              <CtaLink
                href="/quotefc"
                className="md:hidden rounded-full bg-ink-900 text-white text-sm font-semibold px-4 py-2"
              >
                Get Quote
              </CtaLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
