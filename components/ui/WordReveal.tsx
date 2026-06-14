'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';

/**
 * Per-word reveal (reference: ikore). Splits `text` into words and lets each one
 * fade + un-blur up in sequence as the element scrolls into view. The stagger
 * and easing live in globals.css (`.word-reveal`); this component only splits
 * the words and toggles the `.in` class via a single IntersectionObserver.
 * Reduced-motion is handled in CSS (words show instantly).
 */
export default function WordReveal({
  text,
  as: Tag = 'span',
  className = '',
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keep whitespace tokens so spacing/wrapping survives; only real words animate.
  const tokens = text.split(/(\s+)/);
  let wi = 0;

  return (
    <Tag ref={ref} className={`word-reveal ${inView ? 'in' : ''} ${className}`.trim()}>
      {tokens.map((tok, i) =>
        /^\s+$/.test(tok) ? (
          <span key={i}> </span>
        ) : (
          <span
            key={i}
            className="word-reveal__w"
            style={{ '--w-i': wi++ } as CSSProperties}
          >
            {tok}
          </span>
        )
      )}
    </Tag>
  );
}
