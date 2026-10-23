import { FINAL_CTA, LANDING_CTA_HINT } from "@/constants/landing";
import { PrimaryCta } from "./PrimaryCta";

export function FinalCta() {
  return (
    <section
      className="border-t border-[var(--stroke)] bg-gradient-to-b from-[var(--accent-soft)] via-[var(--paper-warm)]/40 to-transparent px-5 py-20 sm:px-8 sm:py-24"
      aria-labelledby="cta-final-heading"
    >
      <div className="mx-auto max-w-xl text-center md:max-w-2xl lg:max-w-3xl">
        <h2
          id="cta-final-heading"
          className="font-serif text-[1.65rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-[1.85rem]"
        >
          {FINAL_CTA.title}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-[var(--muted)] lg:max-w-xl">
          {FINAL_CTA.body}
        </p>
        <div className="mt-12 flex flex-col items-center gap-3">
          <PrimaryCta href="/receber">{FINAL_CTA.ctaLabel}</PrimaryCta>
          <p className="text-center text-xs font-medium text-[var(--muted)] sm:text-[0.8125rem]">
            {LANDING_CTA_HINT}
          </p>
        </div>
      </div>
    </section>
  );
}
