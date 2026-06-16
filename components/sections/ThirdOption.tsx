import Reveal from '@/components/ui/Reveal';
import SectionMedia from '@/components/ui/SectionMedia';
import { THIRD_OPTION_PARAS, THIRD_OPTION_BOLD } from '@/lib/content';

/** The movement / mission band. Warm, framed with hairline rules; navy text, coral accents. */
export default function ThirdOption() {
  return (
    <section className="border-y border-navy/10 bg-warm py-16 sm:py-20 lg:py-24">
      <div className="container-reading text-center">
        {/* The third door, made literal: a woman at the threshold, choosing peace. */}
        <SectionMedia
          src="/Section-Images/section-image6.png"
          alt="A woman standing at a doorway, choosing peace"
          sizes="(max-width: 768px) 100vw, 600px"
          className="mx-auto mb-11 w-full max-w-xl"
        />
        <Reveal>
          <p className="eyebrow mb-4">The third door</p>
          <h2 className="text-balance text-[28px] font-semibold leading-[1.15] sm:text-[36px] lg:text-[40px]">
            You were never meant to just survive it
          </h2>
        </Reveal>

        <Reveal className="mt-7 space-y-5">
          <p className="lede">{THIRD_OPTION_PARAS[0]}</p>
          <p className="font-serif text-[22px] font-semibold text-coral sm:text-[26px]">
            {THIRD_OPTION_PARAS[1]}
          </p>
          <p className="font-body text-[16px] font-semibold leading-relaxed text-navy sm:text-[17px]">
            {THIRD_OPTION_PARAS[2]}
          </p>
          <p className="lede">{THIRD_OPTION_PARAS[3]}</p>
          <p className="lede">{THIRD_OPTION_PARAS[4]}</p>
        </Reveal>

        <Reveal className="mt-8">
          <p className="font-serif text-[20px] font-semibold leading-snug text-navy sm:text-[24px]">
            {THIRD_OPTION_BOLD}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
