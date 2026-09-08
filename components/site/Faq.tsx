"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

const faqs = [
  {
    q: "What is life insurance?",
    a: "Life insurance is a contract where you pay a monthly premium and, in exchange, your beneficiaries receive a lump-sum payout if you pass away during the policy term. It's designed to replace your income and protect the people who depend on you.",
  },
  {
    q: "What is the most affordable type of life insurance?",
    a: "Term life insurance is generally the most affordable option. Unlike whole life, it covers you for a fixed term (10, 20, or 30 years) with predictable, low premiums — ideal for most families.",
  },
  {
    q: "Who needs life insurance?",
    a: "Anyone with dependents — a spouse, children, aging parents, or a business partner — should consider life insurance. If someone would suffer financially if you were gone, coverage is worth having.",
  },
  {
    q: "Can I buy life insurance as a senior?",
    a: `Yes. ${brand.name} offers coverage for applicants up to age 75. Premiums are higher at older ages, but affordable options are still available, particularly for shorter terms.`,
  },
  {
    q: `Why should I choose ${brand.name}?`,
    a: "We combine transparent pricing, a fast online application (no medical exam in most cases), and licensed agents who work for you — not on commission-driven sales scripts.",
  },
  {
    q: "What information do I need to get a life insurance quote?",
    a: "Just your date of birth, state, sex assigned at birth, tobacco use, general health, and coverage preferences. A quote takes about 3 minutes.",
  },
  {
    q: "How to buy the right amount of life insurance coverage",
    a: "A common rule of thumb is 10–15× your yearly income — enough to replace lost earnings and cover major expenses like a mortgage, education, and final costs.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-cream border-y border-ink-300/20">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-3 gap-12">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-mint-900 tracking-tight leading-tight">
            Life insurance resources
          </h2>
          <p className="mt-4 text-ink-500">
            Ready to understand life insurance better? We&apos;ve got answers and
            resources to help.
          </p>
          <button className="mt-6 rounded-full bg-ink-900 hover:bg-ink-700 text-white text-sm font-semibold px-6 py-3 transition-colors">
            SEE ALL
          </button>
        </div>
        <div className="md:col-span-2 divide-y divide-ink-300/30">
          {faqs.map((f, idx) => {
            const isOpen = open === idx;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-5 group"
                >
                  <span
                    className={cn(
                      "font-medium text-lg transition-colors",
                      isOpen ? "text-mint-800" : "text-ink-900 group-hover:text-mint-700",
                    )}
                  >
                    {f.q}
                  </span>
                  <span
                    className={cn(
                      "flex-shrink-0 ml-4 rounded-full p-1.5 transition-colors",
                      isOpen ? "bg-mint-500 text-white" : "text-mint-600",
                    )}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {isOpen && (
                  <p className="pb-6 pr-10 text-ink-700 leading-relaxed animate-fade-in">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
