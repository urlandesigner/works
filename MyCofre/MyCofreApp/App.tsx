import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/features/auth';
import { TransactionsSyncProvider } from './src/features/transactions';
import { ValuesVisibilityProvider } from './src/features/values-visibility';
import { RootTabs } from './src/navigation/RootTabs';
import { LoginScreen } from './src/screens/LoginScreen';
import { ThemeProvider, useTheme } from './src/theme';

function ThemedApp() {
  const { theme, colorScheme } = useTheme();
  const { user, loading } = useAuth();
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const merged = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      background: theme.colors.background,
      card: theme.colors.tabBar,
      border: theme.colors.tabBarBorder,
      primary: theme.colors.accent,
      text: theme.colors.textPrimary,
    },
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer theme={merged}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={Platform.OS === 'android' ? false : undefined}
      />
      <RootTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ValuesVisibilityProvider>
              <TransactionsSyncProvider>
                <ThemedApp />
              </TransactionsSyncProvider>
            </ValuesVisibilityProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
