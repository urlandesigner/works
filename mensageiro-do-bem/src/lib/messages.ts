import type { Message } from "@/constants/messages";
import { MOCK_MESSAGES } from "@/constants/messages";

export function getMessageById(id: string | undefined | null): Message | null {
  if (!id || typeof id !== "string") return null;
  return MOCK_MESSAGES.find((m) => m.id === id) ?? null;
}

/** Escolhe uma mensagem ao acaso (apenas cliente ou lógica efêmera; não persiste). */
export function pickRandomMessage(): Message {
  const i = Math.floor(Math.random() * MOCK_MESSAGES.length);
  return MOCK_MESSAGES[i]!;
}

export function getDefaultMessage(): Message {
  return MOCK_MESSAGES[0]!;
}

export function buildShareText(message: Message): string {
  const body = message.body.replace(/\n\n/g, "\n");
  return `${body}\n\n— ${message.closing}`;
}
