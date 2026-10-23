import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

type FabConfig = {
  id: symbol;
  onPress: () => void;
  accessibilityLabel: string;
  bottomOffset?: number;
};

type FloatingActionButtonContextValue = {
  tabBarHeight: number;
  setFab: (config: FabConfig) => void;
  clearFab: (id: symbol) => void;
};

const FAB_GAP_FROM_TAB_BAR = 40;

const FloatingActionButtonContext = createContext<FloatingActionButtonContextValue | null>(null);

export function FloatingActionButtonHost({
  children,
  tabBarHeight,
}: {
  children: ReactNode;
  tabBarHeight: number;
}) {
  const { theme } = useTheme();
  const [fabConfig, setFabConfig] = useState<FabConfig | null>(null);

  const setFab = useCallback((config: FabConfig) => {
    setFabConfig(config);
  }, []);

  const clearFab = useCallback((id: symbol) => {
    setFabConfig((current) => (current?.id === id ? null : current));
  }, []);

  const contextValue = useMemo(
    () => ({ tabBarHeight, setFab, clearFab }),
    [clearFab, setFab, tabBarHeight],
  );

  const resolvedBottom = fabConfig?.bottomOffset ?? tabBarHeight + FAB_GAP_FROM_TAB_BAR;

  return (
    <FloatingActionButtonContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}

        {fabConfig ? (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={fabConfig.accessibilityLabel}
              onPress={fabConfig.onPress}
              style={({ pressed }) => [
                styles.fab,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.radius.full,
                  bottom: resolvedBottom,
                  right: theme.spacing.screenPadding,
                  shadowColor: '#020617',
                },
                theme.shadows.lg,
                pressed ? styles.fabPressed : undefined,
              ]}
            >
              <Ionicons name="add" size={26} color={theme.colors.background} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </FloatingActionButtonContext.Provider>
  );
}

export function useFloatingActionButtonHost() {
  return useContext(FloatingActionButtonContext);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  fabPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.96 }],
  },
});
