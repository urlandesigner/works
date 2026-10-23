import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useContentFrame } from '../hooks/useContentFrame';
import { useFloatingActionButtonHost } from './FloatingActionButtonHost';
import { getTabbedScreenBottomPadding, SCREEN_BOTTOM_SPACING } from '../layout/screenMetrics';
import { useTheme } from '../theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
};

export function AppScreen({ children, scroll, contentContainerStyle, style }: Props) {
  const { theme } = useTheme();
  const { gutter, maxWidth } = useContentFrame();
  const insets = useSafeAreaInsets();
  const fabHost = useFloatingActionButtonHost();

  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const scrollBottomPadding = fabHost
    ? Math.max(getTabbedScreenBottomPadding(insets.bottom), fabHost.tabBarHeight + SCREEN_BOTTOM_SPACING)
    : insets.bottom + SCREEN_BOTTOM_SPACING;

  const contentShell = (
    <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>{children}</View>
  );

  if (scroll) {
    return (
      <SafeAreaView style={[rootStyle, style]} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            {
              paddingHorizontal: gutter,
              paddingTop: theme.spacing.lg,
              paddingBottom: scrollBottomPadding,
              alignItems: 'center',
            },
            contentContainerStyle,
          ]}
        >
          {contentShell}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[rootStyle, styles.static, style]} edges={['top', 'left', 'right']}>
      <View style={[styles.flex, { paddingHorizontal: gutter }]}>
        <View style={{ flex: 1, width: '100%', maxWidth, alignSelf: 'center' }}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  static: { flex: 1 },
  scrollView: { flex: 1 },
});
