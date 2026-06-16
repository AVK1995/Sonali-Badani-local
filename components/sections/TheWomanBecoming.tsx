import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import SectionMedia from '@/components/ui/SectionMedia';
import { THE_WOMAN_PARAS } from '@/lib/content';

/** 3b · Identity beat. She meets her own reflection again. Text left, mirror right. */
export default function TheWomanBecoming() {
  return (
    <Section>
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Copy */}
          <div className="order-2 text-center lg:order-1">
            <SectionHeading align="center" eyebrow="This is about you" title="The woman you've been becoming" />
            <Reveal className="mt-6 space-y-5">
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

          {/* Mirror — she looks at herself again */}
          <SectionMedia
            src="/Section-Images/section-image1.png"
            alt="A woman meeting her own reflection in the mirror"
            sizes="(max-width: 1024px) 100vw, 540px"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </Section>
  );
}
