import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import Checklist from '@/components/ui/Checklist';
import SectionMedia from '@/components/ui/SectionMedia';
import { SOUND_LIKE_YOU, SOUND_LIKE_YOU_CLOSE } from '@/lib/content';

export default function SoundLikeYou() {
  return (
    <Section tint>
      <div className="container-page">
        <SectionHeading eyebrow="The quiet signs" title="Does this sound like you" />

        {/* The loneliness made visible, right beside the symptoms that name it. */}
        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-9 lg:grid-cols-2 lg:gap-14">
          <SectionMedia
            src="/Section-Images/section-image2.png"
            alt="A couple sitting on the same sofa, worlds apart"
            sizes="(max-width: 1024px) 100vw, 540px"
            className="order-1"
          />
          <div className="order-2">
            <Checklist items={SOUND_LIKE_YOU} />
          </div>
        </div>

        <Reveal className="mx-auto mt-10 max-w-reading text-center">
          <p className="font-serif text-[19px] italic leading-snug text-navy sm:text-[23px]">
            {SOUND_LIKE_YOU_CLOSE}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
