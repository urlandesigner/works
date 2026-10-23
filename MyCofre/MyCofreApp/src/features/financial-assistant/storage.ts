import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AssistantMessage } from './types';

function getMessagesKey(userId?: string | null): string {
  return `@app-financeiro/financial-assistant/messages.v1:${userId ?? 'guest'}`;
}

export async function loadAssistantMessages(userId?: string | null): Promise<AssistantMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(getMessagesKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAssistantMessages(
  messages: AssistantMessage[],
  userId?: string | null,
): Promise<void> {
  try {
    await AsyncStorage.setItem(getMessagesKey(userId), JSON.stringify(messages));
  } catch {
    /* keep chat functional even if local persistence fails */
  }
}
