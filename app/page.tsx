import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { PricingTiles } from "@/components/site/PricingTiles";
import { Testimonials } from "@/components/site/Testimonials";
import { FeaturedInsight } from "@/components/site/FeaturedInsight";
import { Faq } from "@/components/site/Faq";
import { HelpCta } from "@/components/site/HelpCta";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <PricingTiles />
        <Testimonials />
        <FeaturedInsight />
        <Faq />
        <HelpCta />
      </main>
      <Footer />
    </>
  );
}
