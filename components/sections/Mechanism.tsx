import { Section, SectionHeading } from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import SectionMedia from '@/components/ui/SectionMedia';
import { MECHANISM_PARAS } from '@/lib/content';

export default function Mechanism() {
  return (
    <Section>
      <div className="container-page">
        <SectionHeading eyebrow="The One Partner Pivot" title="What if you didn't need him to change" />

        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-9 lg:grid-cols-2 lg:gap-12">
          {/* The felt result of the pivot: a quieter morning, the first shift */}
          <SectionMedia
            src="/Section-Images/section-image3.png"
            alt="A woman sitting quietly with her tea, calmer than before"
            sizes="(max-width: 1024px) 100vw, 520px"
            className="order-1"
          />
          <div className="order-2 rounded-3xl border border-navy/10 bg-warm p-7 shadow-card sm:p-9">
            <Reveal className="space-y-5">
              {MECHANISM_PARAS.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 1
                      ? 'font-body text-[16px] font-semibold leading-relaxed text-navy sm:text-[17px]'
                      : 'lede'
                  }
                >
                  {p}
                </p>
              ))}
            </Reveal>
          </div>
        </div>

        {/* Pull line as a navy banner with a coral keyword (reference: finish-strong) */}
        <Reveal className="mx-auto mt-9 max-w-2xl">
          <div className="rounded-[1.5rem] bg-navy px-7 py-6 text-center shadow-[0_18px_50px_-16px_rgba(32,63,92,0.6)] sm:px-10">
            <p className="font-body text-[16px] font-bold uppercase leading-snug tracking-[0.04em] text-white sm:text-[19px]">
              Most women feel the <span className="text-coral">first shift</span> before they reach the
              end.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
