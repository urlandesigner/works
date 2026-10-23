"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Message } from "@/constants/messages";
import { getMessageById } from "@/lib/messages";
import { readPaymentSession } from "@/lib/payment-session";
import { MessageHistoryRecorder } from "./MessageHistoryRecorder";
import { MensagemAnimated } from "./MensagemAnimated";

function Verifying() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-20">
      <p className="text-sm text-[var(--muted)]">Preparando seu momento...</p>
    </div>
  );
}

export function MensagemGate() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number | null>(null);

  const id = searchParams.get("id")?.trim() ?? "";

  useEffect(() => {
    const session = readPaymentSession();
    if (
      !session ||
      session.paymentStatus !== "confirmed" ||
      !session.paymentId ||
      !id ||
      session.messageId !== id
    ) {
      router.replace("/receber");
      return;
    }
    const m = getMessageById(id);
    if (!m) {
      router.replace("/receber");
      return;
    }
    setContributionAmount(typeof session.amount === "number" ? session.amount : null);
    setMessage(m);
  }, [id, router]);

  if (!message) {
    return <Verifying />;
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <MessageHistoryRecorder
        id={message.id}
        content={message.body}
        category={message.category ?? "mensagem"}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[18vh] h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--glow-1)] blur-3xl opacity-35 sm:top-[22vh]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[15%] right-[10%] h-48 w-48 rounded-full bg-[var(--glow-2)] blur-3xl opacity-25"
        aria-hidden
      />

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 py-20 sm:px-10 sm:py-28 lg:px-12 md:py-32">
        <MensagemAnimated
          key={message.id}
          messageId={message.id}
          body={message.body}
          contributionAmount={contributionAmount}
        />
      </main>
    </div>
  );
}
