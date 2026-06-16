import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import Checklist from '@/components/ui/Checklist';
import SectionMedia from '@/components/ui/SectionMedia';
import { ANOTHER_VERSION_PARAS, OUTCOMES_INTRO, OUTCOMES } from '@/lib/content';

export default function AnotherVersion() {
  return (
    <Section>
      <div className="container-page">
        <SectionHeading eyebrow="Thirty days from now" title="There's another version of this" />

        <Reveal className="mx-auto mt-8 max-w-reading space-y-5 text-center">
          <p className="lede">{ANOTHER_VERSION_PARAS[0]}</p>
          <p className="font-serif text-[20px] italic text-navy sm:text-[24px]">
            {ANOTHER_VERSION_PARAS[1]}
          </p>
          <p className="lede">{ANOTHER_VERSION_PARAS[2]}</p>
        </Reveal>

        {/* The version of an ordinary morning that becomes possible, beside the list. */}
        <div className="mx-auto mt-12 grid max-w-5xl items-center gap-9 lg:grid-cols-2 lg:gap-14">
          <SectionMedia
            src="/Section-Images/section-image4.png"
            alt="A couple close again, sharing an easy morning"
            sizes="(max-width: 1024px) 100vw, 540px"
            className="order-1"
          />
          <div className="order-2">
            <Reveal>
              <p className="font-body text-[15px] font-semibold uppercase tracking-wide text-navy/60">
                {OUTCOMES_INTRO}
              </p>
            </Reveal>
            <div className="mt-5">
              <Checklist items={OUTCOMES} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
