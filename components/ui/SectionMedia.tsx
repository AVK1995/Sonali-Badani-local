import Image from 'next/image';
import Reveal from './Reveal';
import Sparkle from './Sparkle';
import { cn } from '@/lib/utils';

/**
 * Editorial photo frame. Seats real photography inside our cream/navy palette so
 * it reads as a designed moment, not a pasted stock image: rounded card, hairline
 * white border + navy ring, soft premium shadow, a warm coral halo, and a small
 * gold sparkle accent. Uses next/image (the source photos are large PNGs).
 *
 * The section photos are 3:2 (1536x1024), so the default aspect-[3/2] frame fits
 * with zero crop. `glow` controls the coral halo; `caption` adds an optional
 * coral kicker beneath the frame.
 */
export default function SectionMedia({
  src,
  alt,
  aspect = 'aspect-[3/2]',
  priority = false,
  sizes = '(max-width: 1024px) 100vw, 50vw',
  className,
  imgClassName = 'object-cover',
  glow = true,
  sparkle = true,
  reveal = true,
  revealVariant = 'blur',
  caption,
}: {
  src: string;
  alt: string;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  glow?: boolean;
  sparkle?: boolean;
  reveal?: boolean;
  revealVariant?: 'up' | 'left' | 'right' | 'scale' | 'blur';
  caption?: React.ReactNode;
}) {
  const Frame = reveal ? Reveal : 'figure';
  const frameProps = reveal
    ? { as: 'figure' as const, variant: revealVariant, className: cn('relative', className) }
    : { className: cn('relative', className) };
  return (
    <Frame {...frameProps}>
      {glow && (
        <div
          className="halo pointer-events-none absolute -inset-3 rounded-[2rem] bg-coral/15 blur-2xl"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-warm shadow-[0_30px_70px_-32px_rgba(32,63,92,0.5)] ring-1 ring-navy/[0.07]',
          aspect
        )}
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={imgClassName} />
        {/* Whisper-soft warm vignette seats the photo into the page without dimming it. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.6rem] ring-1 ring-inset ring-gold/15"
          aria-hidden="true"
        />
      </div>

      {sparkle && (
        <>
          <Sparkle twinkle className="absolute -left-2.5 top-7 h-4 w-4 text-gold" />
          <Sparkle twinkle className="absolute -right-2 bottom-9 h-3.5 w-3.5 text-gold/80" />
        </>
      )}

      {caption && (
        <figcaption className="mt-4 text-center font-body text-[12.5px] font-semibold uppercase tracking-[0.16em] text-coral-dark">
          {caption}
        </figcaption>
      )}
    </Frame>
  );
}
