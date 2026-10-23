"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type MouseEventHandler, type ReactNode } from "react";

type PrimaryCtaProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "soft";
  className?: string;
};

export function PrimaryCta({
  href,
  children,
  variant = "solid",
  className = "",
}: PrimaryCtaProps) {
  const router = useRouter();
  const [showTransition, setShowTransition] = useState(false);
  const shouldUseTransition = useMemo(() => href === "/receber", [href]);

  const base =
    "inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide shadow-sm transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto sm:min-w-[18rem]";

  const styles =
    variant === "solid"
      ? "bg-gradient-to-b from-[#d6786c] via-[var(--accent)] to-[var(--accent-mid)] text-[var(--accent-foreground)] shadow-[0_4px_20px_-4px_rgba(198,94,82,0.55),0_1px_0_0_rgba(255,255,255,0.25)_inset] hover:brightness-[1.04] hover:shadow-[0_6px_28px_-4px_rgba(198,94,82,0.5),0_1px_0_0_rgba(255,255,255,0.28)_inset] active:scale-[0.98] active:brightness-[0.98] focus-visible:outline-[var(--accent-mid)]"
      : "border border-[var(--accent)]/30 bg-[var(--paper)]/85 text-[var(--accent-mid)] backdrop-blur-sm hover:border-[var(--accent)]/45 hover:bg-[var(--accent-soft)] focus-visible:outline-[var(--accent-mid)]";

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!shouldUseTransition) return;
    event.preventDefault();
    setShowTransition(true);
    window.setTimeout(() => {
      router.push(href);
    }, 1450);
  };

  return (
    <>
      <Link
        href={href}
        onClick={handleClick}
        className={`${base} ${styles} ${className}`}
      >
        {children}
      </Link>
      {showTransition ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-[rgba(38,30,24,0.35)] p-6 backdrop-blur-[5px]"
          role="dialog"
          aria-modal="true"
          aria-label="Preparando sua experiencia"
        >
          <div className="w-full max-w-sm rounded-3xl border border-[var(--stroke)] bg-[var(--paper)] px-7 py-8 text-center shadow-[var(--shadow-ticket)]">
            <div
              className="mx-auto h-11 w-11 rounded-full border-2 border-[var(--stroke-strong)] border-t-[var(--accent-mid)] animate-spin"
              aria-hidden
            />
            <p className="mt-5 font-serif text-lg leading-relaxed text-[var(--ink)]">
              💛 Escolhendo uma mensagem com carinho pra voce...
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
