import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { Quote } from 'lucide-react';
import TestimonialsCarousel from './TestimonialsCarousel';
import {
  TESTIMONIALS_HEAD,
  TESTIMONIALS_INTRO,
  TESTIMONIALS_LINE,
  TESTIMONIALS_PRIVACY,
} from '@/lib/content';

/**
 * Real client messages (WhatsApp), shared with permission. We frame the actual
 * screenshots in a white "matted" card so they read as authentic proof while
 * staying on our cream/navy/coral palette (rather than pasting raw dark images).
 * Width/height are passed so the masonry reserves space and doesn't reflow as
 * the images lazy-load. IMG_3515 is omitted (a duplicate of IMG_3511).
 */
export type Shot = { src: string; w: number; h: number };

export const TESTIMONIAL_SHOTS: Shot[] = [
  { src: '/Client%20Testimonials/IMG_3511.JPG', w: 999, h: 1117 },
  { src: '/Client%20Testimonials/IMG_3512.JPG', w: 951, h: 981 },
  { src: '/Client%20Testimonials/IMG_3513.JPG', w: 894, h: 1600 },
  { src: '/Client%20Testimonials/IMG_3514.JPG', w: 1137, h: 1197 },
];

function ShotCard({ shot }: { shot: Shot }) {
  return (
    <figure className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-navy/10 bg-white p-2.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shot.src}
        width={shot.w}
        height={shot.h}
        loading="lazy"
        alt="A message from a client who worked with Sonali"
        className="w-full rounded-xl ring-1 ring-navy/10"
      />
      <figcaption className="flex items-center gap-1.5 px-1.5 pb-0.5 pt-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/45">
        <Quote className="h-3.5 w-3.5 text-coral" aria-hidden="true" />
        Real client message
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <Section>
      <div className="container-page">
        <SectionHeading eyebrow="In their words" title={TESTIMONIALS_HEAD} lede={TESTIMONIALS_INTRO} />

        {/* Desktop / tablet — masonry of framed real messages (varying heights) */}
        <Reveal className="mx-auto mt-10 hidden max-w-3xl gap-5 sm:block sm:columns-2">
          {TESTIMONIAL_SHOTS.map((s) => (
            <ShotCard key={s.src} shot={s} />
          ))}
        </Reveal>

        {/* Mobile — swipeable carousel of the same framed messages */}
        <TestimonialsCarousel shots={TESTIMONIAL_SHOTS} />

        <Reveal className="mt-10 text-center">
          <p className="font-serif text-[20px] italic text-navy sm:text-[24px]">{TESTIMONIALS_LINE}</p>
        </Reveal>

        {/* Privacy note — Sonali's personal promise */}
        <Reveal className="mx-auto mt-8 max-w-2xl rounded-2xl border border-navy/10 bg-white px-6 py-7 text-center shadow-soft sm:px-10">
          <p className="font-serif text-[16px] italic leading-relaxed text-navy/80 sm:text-[17.5px]">
            {TESTIMONIALS_PRIVACY}
          </p>
          <p className="mt-4 font-body text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-dark">
            A note from Sonali
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
