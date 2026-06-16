import Image from 'next/image';
import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { COMMUNITY_PARAS } from '@/lib/content';

export default function Community() {
  return (
    <Section tint>
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card lg:grid-cols-2">
          {/* The circle, made real: women holding space for one another */}
          <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
            <Image
              src="/Section-Images/section-image5.png"
              alt="A small circle of women listening to one another"
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/15" aria-hidden="true" />
          </div>

          {/* Copy */}
          <div className="p-8 text-center sm:p-10 lg:p-12">
            <SectionHeading align="center" eyebrow="Your circle" title="You won't do this alone" />
            <Reveal className="mt-6 space-y-5">
              <p className="lede">{COMMUNITY_PARAS[0]}</p>
              <p className="lede">{COMMUNITY_PARAS[1]}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
