'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { carouselSpring } from '@/lib/motion';

type Shot = { src: string; w: number; h: number };

/**
 * Mobile testimonials carousel — swipeable, snap-to-card track of the real
 * client messages. Each screenshot is centred (object-contain) in a fixed-height
 * cream frame so the varying aspect ratios stay uniform and nothing crops.
 * Reduced-motion users get instant snaps. Desktop uses the masonry in
 * Testimonials.tsx.
 */
export default function TestimonialsCarousel({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const count = shots.length;
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));

  return (
    <div className="mt-10 sm:hidden">
      <div className="overflow-hidden">
        <motion.ul
          className="flex items-stretch"
          animate={{ x: `-${index * 100}%` }}
          transition={reduce ? { duration: 0 } : carouselSpring}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x;
            const flick = info.velocity.x;
            if (swipe < -50 || flick < -400) setIndex((i) => clamp(i + 1));
            else if (swipe > 50 || flick > 400) setIndex((i) => clamp(i - 1));
          }}
        >
          {shots.map((s, i) => (
            <li key={i} className="w-full shrink-0 px-1">
              <figure className="select-none rounded-2xl border border-navy/10 bg-white p-2.5 shadow-soft">
                <div className="flex h-[58vh] max-h-[520px] items-center justify-center overflow-hidden rounded-xl bg-cream ring-1 ring-navy/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    width={s.w}
                    height={s.h}
                    loading="lazy"
                    draggable={false}
                    alt="A message from a client who worked with Sonali"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <figcaption className="flex items-center gap-1.5 px-1 pb-0.5 pt-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/45">
                  <Quote className="h-3.5 w-3.5 text-coral" aria-hidden="true" />
                  Real client message
                </figcaption>
              </figure>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {shots.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show message ${i + 1} of ${count}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-coral' : 'w-2 bg-navy/20 hover:bg-navy/35'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
