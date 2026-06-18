import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import SectionMedia from '@/components/ui/SectionMedia';
import { THE_WOMAN_PARAS } from '@/lib/content';

/** 3b · Identity beat. Heading on top, then the mirror, then the copy (so the
 * title/eyebrow sit above the image on mobile, matching the "Sound like you" beat). */
export default function TheWomanBecoming() {
  return (
    <Section>
      <div className="container-page">
        <SectionHeading align="center" eyebrow="This is about you" title="The woman you've been becoming" />

        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-9 lg:grid-cols-2 lg:gap-14">
          {/* Mirror — she looks at herself again */}
          <SectionMedia
            src="/Section-Images/section-image1.png"
            alt="A woman meeting her own reflection in the mirror"
            sizes="(max-width: 1024px) 100vw, 540px"
            className="order-1"
          />

          {/* Copy */}
          <div className="order-2 text-center lg:text-left">
            <Reveal className="space-y-5">
              <p className="lede">{THE_WOMAN_PARAS[0]}</p>
              <p className="lede">{THE_WOMAN_PARAS[1]}</p>
              <p className="lede">{THE_WOMAN_PARAS[2]}</p>
            </Reveal>
            <Reveal className="mt-7">
              <p className="font-serif text-[20px] italic leading-snug text-navy sm:text-[25px]">
                {THE_WOMAN_PARAS[3]}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
