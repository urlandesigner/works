"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PrimaryCta } from "@/components/landing/PrimaryCta";
import type { DeliveredMessage } from "@/lib/storage";
import { getHistory } from "@/lib/storage";

function formatDeliveredAt(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoricoClient() {
  const [items, setItems] = useState<DeliveredMessage[] | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setItems([...getHistory()].reverse());
    });
  }, []);

  if (items === null) {
    return (
      <p className="py-16 text-center text-sm text-[var(--muted)]">
        Carregando…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-6 sm:px-8">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-6 py-14 text-center shadow-[var(--shadow-ticket)]">
          <p className="font-serif text-lg text-[var(--ink)]">
            Nenhuma mensagem guardada ainda.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Quando você abrir uma mensagem no fluxo, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={`${item.id}-${item.createdAt}-${index}`}>
              <article className="rounded-2xl border border-[var(--paper-edge)] bg-[var(--paper)] px-5 py-5 shadow-[var(--shadow-ticket)] sm:px-6 sm:py-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] pb-3">
                  <time
                    className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]"
                    dateTime={new Date(item.createdAt).toISOString()}
                  >
                    {formatDeliveredAt(item.createdAt)}
                  </time>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--accent-mid)]">
                    {item.category}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-left text-sm leading-relaxed text-[var(--ink)]/90 line-clamp-6 sm:text-[0.9375rem]">
                  {item.content}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col items-center gap-6">
        <PrimaryCta href="/receber" className="w-full sm:w-auto">
          Receber outra mensagem
        </PrimaryCta>
        <Link
          href="/"
          className="text-sm font-medium text-[var(--muted)] underline-offset-4 transition hover:text-[var(--accent-mid)] hover:underline"
        >
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
