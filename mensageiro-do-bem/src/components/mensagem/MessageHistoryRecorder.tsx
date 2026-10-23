"use client";

import { useEffect } from "react";
import { saveMessage } from "@/lib/storage";

type MessageHistoryRecorderProps = {
  id: string;
  content: string;
  category: string;
};

/**
 * Grava a entrega no localStorage ao abrir a mensagem (sem alterar o layout).
 */
export function MessageHistoryRecorder({
  id,
  content,
  category,
}: MessageHistoryRecorderProps) {
  useEffect(() => {
    saveMessage({
      id,
      content,
      category,
      createdAt: Date.now(),
    });
  }, [id, content, category]);

  return null;
}
