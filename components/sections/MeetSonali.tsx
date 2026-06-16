import { Section } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import Sparkle from '@/components/ui/Sparkle';
import SectionMedia from '@/components/ui/SectionMedia';
import { MEET_SONALI } from '@/lib/content';

export default function MeetSonali() {
  return (
    <Section tint>
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Portrait — Sonali, in her own space */}
          <SectionMedia
            src="/Hero-Image/sonali-hero-image2.jpeg"
            alt="Sonali Badani at her desk, founder of The Soul Space"
            sizes="(max-width: 1024px) 100vw, 540px"
            className="order-1"
          />

          {/* Bio */}
          <div className="order-2 text-center lg:text-left">
            <Reveal>
              <p className="mb-3 flex items-center justify-center gap-2 lg:justify-start">
                <Sparkle twinkle className="h-3 w-3 text-gold" />
                <span className="eyebrow">Meet Sonali</span>
              </p>
              <h2 className="text-balance text-[28px] font-semibold leading-tight sm:text-[36px] lg:text-[40px]">
                {MEET_SONALI.name}
              </h2>
            </Reveal>

            <Reveal className="mt-5">
              <p className="font-body text-[15px] font-semibold text-coral-dark sm:text-[16.5px]">
                {MEET_SONALI.title}
              </p>
            </Reveal>

            <Reveal className="mt-5 space-y-4 font-body text-[15.5px] leading-relaxed text-navy/85 sm:text-[16.5px]">
              {MEET_SONALI.paras.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>

            <Reveal className="mt-7 rounded-2xl border border-coral/40 bg-white px-6 py-5 text-left">
              <p className="font-body text-[15px] leading-relaxed text-navy/90">{MEET_SONALI.callAnchor}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
