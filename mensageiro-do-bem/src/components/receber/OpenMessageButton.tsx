"use client";

import { useRouter } from "next/navigation";
import { pickRandomMessage } from "@/lib/messages";

type OpenMessageButtonProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Sorteia uma mensagem e navega para /mensagem?id=… (sem backend).
 */
export function OpenMessageButton({ children, className = "" }: OpenMessageButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        const message = pickRandomMessage();
        router.push(`/mensagem?id=${encodeURIComponent(message.id)}`);
      }}
      className={`inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-gradient-to-b from-[#d6786c] via-[var(--accent)] to-[var(--accent-mid)] px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide text-[var(--accent-foreground)] shadow-[0_4px_20px_-4px_rgba(198,94,82,0.55),0_1px_0_0_rgba(255,255,255,0.25)_inset] transition duration-200 hover:brightness-[1.04] hover:shadow-[0_6px_28px_-4px_rgba(198,94,82,0.5),0_1px_0_0_rgba(255,255,255,0.28)_inset] active:scale-[0.98] active:brightness-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-mid)] sm:w-auto sm:min-w-[18rem] ${className}`}
    >
      {children}
    </button>
  );
}
