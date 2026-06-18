import type { Metadata } from 'next';
import { Mail, Search, ArrowRight, MessageCircle } from 'lucide-react';

import Logo from '@/components/ui/Logo';
import Footer from '@/components/Footer';
import Reveal from '@/components/ui/Reveal';
import Checklist from '@/components/ui/Checklist';
import Sparkle from '@/components/ui/Sparkle';
import SuccessMark from '@/components/ui/SuccessMark';

export const metadata: Metadata = {
  title: 'Welcome to the One Partner Reset | Sonali Badani',
  robots: { index: false, follow: false },
};

const WHATSAPP_COMMUNITY_URL = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || '#';

/** The repeating WhatsApp community CTA (used after the intro and at the close). */
function CommunityButton() {
  return (
    <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
      <MessageCircle className="h-5 w-5" />
      Join the Community Here
      <ArrowRight className="h-5 w-5" />
    </a>
  );
}

const EMAIL_CONTAINS = [
  'Your login link and access instructions',
  'The full One Partner Reset experience',
  'The Blueprint, workbook, and every bonus',
  'A link to book your 15 minutes with Sonali',
];

const NEXT_STEPS = [
  { tag: 'Get access', title: 'Open your email', body: 'Open the email and access your learning portal.' },
  { tag: 'Find your focus', title: 'Take the Assessment', body: 'Take the Relationship Clarity Assessment first.' },
  { tag: 'See the pattern', title: 'Start the Experience', body: 'Start the One Partner Reset Experience.' },
  { tag: '15 minutes', title: 'Book your call', body: 'Book your 15 minutes with Sonali when you are ready.' },
];

const FOLDERS = ['Promotions', 'Updates', 'Spam', 'Junk'];

export default function ThankYouPage() {
  return (
    <>
      <header className="border-b border-navy/10">
        <div className="container-page flex h-16 items-center justify-center">
          <Logo height={38} />
        </div>
      </header>

      <main>
        {/* 1 · Confirmation */}
        <section className="container-reading pt-14 pb-10 text-center sm:pt-20">
          <Reveal>
            <SuccessMark size={64} />
            <p className="eyebrow mt-6">Payment confirmed</p>
            <h1 className="mt-3 text-balance text-[30px] font-semibold leading-[1.12] sm:text-[42px]">
              Welcome to the One Partner Reset
            </h1>
            <p className="lede mx-auto mt-6 max-w-reading">
              Thank you for trusting yourself enough to take this step. This is the third door, the
              one where you stop surviving your marriage and start designing it, from your side,
              starting tonight.
            </p>
          </Reveal>
        </section>

        {/* 1b · Join the community — the primary first action after purchase */}
        <section className="container-reading pb-12 sm:pb-14">
          <Reveal
            variant="scale"
            className="rounded-3xl border border-coral/40 bg-white px-6 py-8 text-center shadow-card ring-1 ring-coral/15 sm:px-10 sm:py-9"
          >
            <p className="eyebrow mb-3">Step 1 · Start here</p>
            <h2 className="text-[24px] font-semibold sm:text-[30px]">
              Join the Private Love Legacy Community
            </h2>
            <p className="lede mx-auto mt-4 max-w-reading">
              This is where your reset actually begins. Your live call links and
              every update happen inside the community, alongside women walking exactly the same path.
            </p>
            <div className="mt-7">
              <CommunityButton />
            </div>
            <p className="mt-3 font-body text-[12.5px] text-navy/50">Opens in WhatsApp · one tap to join</p>
          </Reveal>
        </section>

        <hr className="rule" />

        {/* 2 · Check email */}
        <section className="container-reading py-14 sm:py-16">
          <Reveal className="rounded-3xl border border-navy/10 bg-white p-7 shadow-soft sm:p-9">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-coral/15">
                <Mail className="h-6 w-6 text-coral-dark" />
              </span>
              <h2 className="mt-4 text-[24px] font-semibold sm:text-[28px]">Check your email now</h2>
            </div>
            <p className="lede mt-5 text-center">
              Your access details are on their way. Within the next few minutes, you&rsquo;ll receive
              an email from <span className="font-semibold text-navy">The Soul Space</span> containing:
            </p>
            <div className="mt-7">
              <Checklist items={EMAIL_CONTAINS} columns />
            </div>
            {/* <div className="mt-7 text-center">
              <a
                href="https://app.tagmango.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Access Your Course
                <ArrowRight className="h-5 w-5" />
              </a>
            </div> */}
          </Reveal>
        </section>

        {/* 3 · Email troubleshooting */}
        <section className="bg-warm py-14 sm:py-16">
          <div className="container-reading">
            <Reveal className="text-center">
              <p className="eyebrow mb-3">Can't find it?</p>
              <h2 className="text-[24px] font-semibold sm:text-[28px]">Can&rsquo;t find the email?</h2>
              <p className="lede mt-5">Please check these folders:</p>
            </Reveal>
            <Reveal className="mx-auto mt-7 flex flex-nowrap items-center justify-center gap-2 sm:gap-3">
              {FOLDERS.map((f) => (
                <span
                  key={f}
                  className="whitespace-nowrap rounded-pill border border-navy/15 bg-white px-3 py-1.5 font-body text-[13px] font-semibold text-navy sm:px-5 sm:py-2 sm:text-[15px]"
                >
                  {f}
                </span>
              ))}
            </Reveal>
            <Reveal className="mx-auto mt-7 max-w-reading text-center">
              <p className="font-body text-[15px] leading-relaxed text-navy/80">
                <Search className="mr-1 inline h-4 w-4 text-coral-dark" />
                Search your inbox for <span className="font-semibold text-navy">The Soul Space</span>.
                If you still don&rsquo;t see it after 10 minutes, write to us at{' '}
                <a href="mailto:connect@sonalibadani.com" className="font-semibold text-coral-dark underline underline-offset-2">
                  connect@sonalibadani.com
                </a>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* 4 · Next steps — schedule-style (matches the landing "What happens next") */}
        <section className="py-14 sm:py-16">
          <div className="container-page">
            <Reveal className="text-center">
              <p className="mb-3 flex items-center justify-center gap-2">
                <Sparkle twinkle className="h-3 w-3 text-gold" />
                <span className="eyebrow">Your next steps</span>
              </p>
              <h2 className="text-[24px] font-semibold sm:text-[30px]">Your next steps</h2>
              <p className="lede mx-auto mt-4 max-w-reading">
                Once you&rsquo;re inside the community, here&rsquo;s your path from here.
              </p>
            </Reveal>

            <div className="mx-auto mt-10 max-w-3xl divide-y divide-navy/10 border-y border-navy/10">
              {NEXT_STEPS.map((s, i) => (
                <Reveal
                  as="div"
                  key={s.title}
                  variant="left"
                  delay={Math.min(i * 70, 350)}
                  className="grid grid-cols-[auto_1fr] items-start gap-5 py-7 sm:gap-9 sm:py-8"
                >
                  <div className="flex w-16 flex-col items-center text-center sm:w-24">
                    <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.2em] text-navy/40">
                      Step
                    </span>
                    <span className="font-serif text-[42px] font-semibold leading-none text-coral sm:text-[58px]">
                      0{i + 1}
                    </span>
                    <span className="mt-2.5 rounded-md bg-coral/[0.12] px-2 py-1 font-body text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-coral-dark">
                      {s.tag}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-serif text-[20px] font-semibold leading-snug text-navy sm:text-[25px]">
                      {s.title}
                    </h3>
                    <p className="mt-2 font-body text-[15px] leading-relaxed text-navy/75 sm:text-[16.5px]">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5 · Final CTA */}
        <section className="relative overflow-hidden py-16 text-center sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-coral/20 blur-3xl"
          />
          <div className="container-reading relative">
            <Reveal>
              <p className="eyebrow mb-3">Don&rsquo;t forget</p>
              <h2 className="text-balance text-[26px] font-semibold sm:text-[34px]">
                To join the Private Love Legacy Community
              </h2>
              <p className="lede mt-5">We&rsquo;ll see you inside.</p>
              <div className="mt-8">
                <CommunityButton />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
