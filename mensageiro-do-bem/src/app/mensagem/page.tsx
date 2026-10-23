import type { Metadata } from "next";
import { Suspense } from "react";
import { MensagemGate } from "@/components/mensagem/MensagemGate";

export const metadata: Metadata = {
  title: "Sua mensagem · Mensageiro do Bem",
  description: "Um momento só seu — mensagem recebida com carinho.",
  robots: { index: false, follow: false },
};

function MensagemFallback() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-20">
      <p className="text-sm text-[var(--muted)]">Um instante, estamos preparando com carinho...</p>
    </div>
  );
}

export default function MensagemPage() {
  return (
    <Suspense fallback={<MensagemFallback />}>
      <MensagemGate />
    </Suspense>
  );
}
