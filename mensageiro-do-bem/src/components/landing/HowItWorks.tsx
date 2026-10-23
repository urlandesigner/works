import {
  LANDING_STEPS,
  LANDING_STEPS_INTRO,
  LANDING_STEPS_TITLE,
} from "@/constants/landing";

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-6 border-t border-[var(--stroke)] bg-[var(--paper-warm)]/75 px-5 py-16 backdrop-blur-[6px] sm:px-8 sm:py-20"
      aria-labelledby="como-funciona-heading"
    >
      <div className="mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
        <h2
          id="como-funciona-heading"
          className="font-serif text-[1.65rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-[1.85rem]"
        >
          {LANDING_STEPS_TITLE}
        </h2>
        <p className="mt-4 max-w-md text-pretty text-[var(--muted)] leading-relaxed lg:max-w-xl">
          {LANDING_STEPS_INTRO}
        </p>

        <ol className="mt-12 flex flex-col gap-5">
          {LANDING_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-5 rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-5 py-6 shadow-[var(--shadow-ticket)] sm:gap-6 sm:px-6 sm:py-7"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent-soft)] font-sans text-sm font-semibold tabular-nums text-[var(--accent-mid)] shadow-sm"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="font-sans text-base font-semibold tracking-tight text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem] sm:leading-[1.7]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
