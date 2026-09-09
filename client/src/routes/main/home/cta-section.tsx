import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import CtaCard from "@/components/features/cta-card";

export default function CtaSection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8 bg-muted/50 pt-21.25">
      <AnimateOnScroll>
        <CtaCard />
      </AnimateOnScroll>
    </section>
  );
}
