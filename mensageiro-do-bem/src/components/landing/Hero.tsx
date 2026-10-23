import { LANDING_HERO, LANDING_HERO_PURPOSE_HINT } from "@/constants/landing";
import { PrimaryCta } from "./PrimaryCta";

export function Hero() {
  return (
    <header className="relative overflow-hidden px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 md:pb-28 md:pt-24">
      <div
        className="pointer-events-none absolute -left-28 top-4 h-80 w-80 rounded-full bg-[var(--glow-1)] blur-3xl opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-[var(--glow-2)] blur-3xl opacity-50"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-xl text-center sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <p className="animate-fade-up font-sans text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)] opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]">
          {LANDING_HERO.eyebrow}
        </p>
        <h1 className="animate-fade-up mt-6 font-serif text-[1.85rem] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] opacity-0 [animation-delay:160ms] [animation-fill-mode:forwards] sm:text-[2.15rem] md:text-[2.35rem] lg:text-[2.55rem] lg:whitespace-nowrap">
          {LANDING_HERO.title}
        </h1>
        <p className="animate-fade-up mt-7 text-base leading-[1.75] text-[var(--muted)] opacity-0 [animation-delay:240ms] [animation-fill-mode:forwards] sm:text-lg sm:leading-[1.8] md:whitespace-nowrap">
          {LANDING_HERO.subtitle}
        </p>
        <div className="animate-fade-up mt-14 flex flex-col items-center gap-5 opacity-0 [animation-delay:320ms] [animation-fill-mode:forwards] sm:mt-16">
          <PrimaryCta href="/receber">{LANDING_HERO.ctaLabel}</PrimaryCta>
          <p className="max-w-[28ch] text-center text-sm leading-relaxed text-[var(--muted)] sm:max-w-[32ch] sm:text-[0.95rem] lg:max-w-[40ch] xl:max-w-[48ch]">
            {LANDING_HERO.supportLine}
          </p>
          {LANDING_HERO_PURPOSE_HINT ? (
            <p className="max-w-[38ch] text-center text-xs leading-relaxed text-[var(--muted)]/90 sm:text-[0.82rem] lg:max-w-[52ch] xl:max-w-[60ch]">
              {LANDING_HERO_PURPOSE_HINT}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
