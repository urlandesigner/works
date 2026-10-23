import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@app-financeiro/values-visibility.v1';

export async function loadStoredValuesHidden(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw === 'hidden';
  } catch {
    return false;
  }
}

export async function persistValuesHidden(isHidden: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, isHidden ? 'hidden' : 'visible');
  } catch {
    /* noop */
  }
}
