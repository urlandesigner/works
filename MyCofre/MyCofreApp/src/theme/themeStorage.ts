import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ColorScheme } from './types';

const STORAGE_KEY = '@app-financeiro/colorScheme';

function isColorScheme(value: string | null): value is ColorScheme {
  return value === 'light' || value === 'dark';
}

export async function loadStoredColorScheme(): Promise<ColorScheme | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return isColorScheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function persistColorScheme(scheme: ColorScheme): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    /* ignore persistence errors — tema em memória continua válido */
  }
}

export async function clearStoredColorScheme(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore reset errors */
  }
}
