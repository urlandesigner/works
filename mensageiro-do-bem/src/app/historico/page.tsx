import type { Metadata } from "next";
import Link from "next/link";
import { HistoricoClient } from "@/components/historico/HistoricoClient";

export const metadata: Metadata = {
  title: "Histórico · Mensageiro do Bem",
  description: "Mensagens que você já recebeu neste aparelho.",
  robots: { index: false, follow: false },
};

export default function HistoricoPage() {
  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--stroke)] bg-[var(--paper-warm)]/50 px-5 py-8 text-center sm:px-8">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[var(--muted)] underline-offset-4 transition hover:text-[var(--accent-mid)] hover:underline"
        >
          ← Início
        </Link>
        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-[1.75rem]">
          Histórico
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Mensagens recebidas neste navegador (armazenadas localmente).
        </p>
      </header>

      <HistoricoClient />
    </div>
  );
}
