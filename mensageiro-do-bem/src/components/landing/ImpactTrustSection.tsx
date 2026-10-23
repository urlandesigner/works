"use client";

import { IMPACT_INITIAL_STATS, IMPACT_META_BRL } from "@/constants/impact";
import { LANDING_HERO } from "@/constants/landing";
import { buildImpactViewModel } from "@/lib/impact";
import type { ImpactStats } from "@/types/impact";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { PrimaryCta } from "./PrimaryCta";
import { FirstDonationDialog } from "./FirstDonationDialog";

function SoftProgress({
  percentage,
  animated,
}: {
  percentage: number;
  animated: boolean;
}) {
  return (
    <div
      className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--paper-warm)] ring-1 ring-inset ring-[var(--stroke)]"
      aria-hidden
    >
      <div
        className="impact-progress-fill h-full rounded-full"
        data-animated={animated ? "true" : "false"}
        style={
          {
            "--impact-progress-target": `${percentage}%`,
          } as CSSProperties
        }
      />
    </div>
  );
}

export function ImpactTrustSection() {
  const [stats, setStats] = useState<ImpactStats>(IMPACT_INITIAL_STATS);
  const view = buildImpactViewModel(stats);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/impact-arrecadacao")
      .then((r) => r.json())
      .then(
        (d: {
          totalArrecadado?: unknown;
          meta?: unknown;
        }) => {
          if (cancelled) return;
          const raw = d.totalArrecadado;
          const total =
            typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
          const metaRaw = d.meta;
          const meta =
            typeof metaRaw === "number" &&
            Number.isFinite(metaRaw) &&
            metaRaw > 0
              ? metaRaw
              : IMPACT_META_BRL;
          setStats({
            totalArrecadado: total,
            meta,
          });
        },
      )
      .catch(() => {
        if (cancelled) return;
        setStats(IMPACT_INITIAL_STATS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;
        setAnimateProgress(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="border-t border-[var(--stroke)] bg-[linear-gradient(180deg,rgba(250,245,236,0.72)_0%,rgba(253,249,243,0.58)_45%,transparent_100%)] px-5 py-14 sm:px-8 sm:py-18"
        aria-labelledby="impact-trust-heading"
      >
        <div className="mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
          <article className="rounded-[1.65rem] border border-[var(--stroke)] bg-[var(--paper)]/95 p-5 shadow-[var(--shadow-ticket)] backdrop-blur-[2px] sm:p-7">
            <h2
              id="impact-trust-heading"
              className="font-serif text-[1.42rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--ink)] sm:text-[1.55rem]"
            >
              {view.title}
            </h2>

            <p className="mt-5 font-serif text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-[2.15rem]">
              {view.highlightedAmount}
            </p>
            {view.amountComplement ? (
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-[1.02rem]">
                {view.amountComplement}
              </p>
            ) : null}

            <div className="mt-7 space-y-3">
              <SoftProgress
                percentage={view.progressPercentage}
                animated={animateProgress}
              />
              <p className="text-sm leading-relaxed text-[var(--muted)]/95">
                {view.progressHint}
              </p>
            </div>

            {view.primeiraDoacaoRealizada ? (
              <p className="mt-5 inline-flex rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]">
                {view.primeiraDoacaoLabel}
              </p>
            ) : null}

            <div className="mt-10">
              <div>
                <PrimaryCta href="/receber" className="sm:min-w-[15rem]">
                  {LANDING_HERO.ctaLabel}
                </PrimaryCta>
              </div>
              <p className="mt-5 text-[1.02rem] font-medium leading-relaxed text-[var(--ink)]/92 sm:text-[1.08rem]">
                {view.ctaLine}
              </p>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]/92">
              {view.regraDoacaoLabel}
            </p>
          </article>
        </div>
      </section>
      <FirstDonationDialog show={view.primeiraDoacaoRealizada} />
    </>
  );
}
