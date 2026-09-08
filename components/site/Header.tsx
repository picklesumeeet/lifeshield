import Link from "next/link";
import { brand } from "@/lib/brand";
import { Phone, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Life Insurance", href: "#" },
  { label: "Basics", href: "#" },
  { label: `Why ${brand.name}`, href: "#" },
];

const utilityItems = [
  { label: "For Agents", href: "#" },
  { label: "For Employers", href: "#" },
  { label: "For Policyholders", href: "#" },
];

export function Header() {
  return (
    <header className="w-full sticky top-0 z-40 bg-cream/90 backdrop-blur">
      <div className="hidden md:block border-b border-mint-100/60 bg-mint-900 text-mint-100 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex justify-end items-center gap-6 h-9">
          {utilityItems.map((i) => (
            <Link key={i.label} href={i.href} className="hover:text-white transition-colors">
              {i.label}
            </Link>
          ))}
          <a
            href={brand.phoneHref}
            className="flex items-center gap-1.5 font-medium text-mint-300 hover:text-white transition-colors"
          >
            <Phone size={12} /> Speak to a Licensed Agent
          </a>
        </div>
      </div>
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
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((i) => (
              <button
                key={i.label}
                className="flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-mint-700 transition-colors"
              >
                {i.label}
                <ChevronDown size={14} />
              </button>
            ))}
            <a
              href="/#quote"
              className="rounded-full bg-mint-500 hover:bg-mint-600 text-white text-sm font-semibold px-5 py-2.5 transition-colors shadow-sm"
            >
              Get My Quote
            </a>
          </nav>
          <a
            href="/#quote"
            className="md:hidden rounded-full bg-mint-500 text-white text-sm font-semibold px-4 py-2"
          >
            Get Quote
          </a>
        </div>
      </div>
    </header>
  );
}
