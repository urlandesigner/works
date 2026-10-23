import {
  MESSAGE_TEASERS,
  MESSAGE_TEASERS_NOTE,
  MESSAGE_TEASERS_TITLE,
} from "@/constants/landing";

export function MessageSamples() {
  return (
    <section
      className="px-5 py-16 sm:px-8 sm:py-20"
      aria-labelledby="amostras-heading"
    >
      <div className="mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
        <p className="max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem] lg:max-w-xl">
          E algo assim pode chegar até você:
        </p>
        <h2
          id="amostras-heading"
          className="mt-4 font-serif text-[1.65rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-[1.85rem]"
        >
          {MESSAGE_TEASERS_TITLE}
        </h2>
        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-[0.9375rem] lg:max-w-xl">
          {MESSAGE_TEASERS_NOTE}
        </p>

        <ul className="mt-12 flex flex-col gap-6">
          {MESSAGE_TEASERS.map((item, i) => (
            <li
              key={i}
              className={i % 2 === 0 ? "sm:-rotate-[0.35deg]" : "sm:rotate-[0.35deg]"}
            >
              <blockquote className="relative overflow-hidden rounded-lg border border-[var(--paper-edge)] bg-[var(--paper)] px-6 py-5 shadow-[var(--shadow-ticket)] sm:px-7 sm:py-6 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-gradient-to-b before:from-[var(--accent)]/90 before:to-[var(--accent)]/35 after:pointer-events-none after:absolute after:-right-6 after:bottom-3 after:h-14 after:w-14 after:rounded-full after:bg-[var(--glow-1)] after:opacity-40 after:blur-2xl">
                <p className="relative font-serif text-[1.0625rem] font-medium italic leading-[1.65] text-[var(--ink)] sm:text-lg sm:leading-[1.7]">
                  “{item.text}”
                </p>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
