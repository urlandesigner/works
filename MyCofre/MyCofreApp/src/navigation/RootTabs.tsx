import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, FloatingActionButtonHost } from '../components';
import { TAB_BAR_BASE_HEIGHT } from '../layout/screenMetrics';
import { AccountsScreen } from '../screens/AccountsScreen';
import { CreditCardsScreen } from '../screens/CreditCardsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { MonthlyClosingScreen } from '../screens/MonthlyClosingScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { WealthScreen } from '../screens/WealthScreen';
import { useTheme } from '../theme';

import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<keyof RootTabParamList, { focused: IconName; outline: IconName }> = {
  Home: { focused: 'home', outline: 'home-outline' },
  Notifications: { focused: 'notifications', outline: 'notifications-outline' },
  More: { focused: 'ellipsis-horizontal-circle', outline: 'ellipsis-horizontal-circle-outline' },
  Accounts: { focused: 'wallet', outline: 'wallet-outline' },
  CreditCards: { focused: 'card', outline: 'card-outline' },
  Investments: { focused: 'trending-up', outline: 'trending-up-outline' },
  MonthlyClosing: { focused: 'calendar', outline: 'calendar-outline' },
  Reports: { focused: 'stats-chart', outline: 'stats-chart-outline' },
  Settings: { focused: 'settings', outline: 'settings-outline' },
  Subscriptions: { focused: 'repeat', outline: 'repeat-outline' },
  Transactions: { focused: 'list', outline: 'list-outline' },
  Goals: { focused: 'flag', outline: 'flag-outline' },
  Wealth: { focused: 'pie-chart', outline: 'pie-chart-outline' },
  Profile: { focused: 'person', outline: 'person-outline' },
};

const tabTitles: Record<keyof RootTabParamList, string> = {
  Home: 'Home',
  Notifications: 'Notificações',
  More: 'Mais',
  Accounts: 'Contas',
  CreditCards: 'Cartões',
  Investments: 'Investimentos',
  MonthlyClosing: 'Fechamento',
  Reports: 'Relatórios',
  Settings: 'Configurações',
  Subscriptions: 'Assinaturas',
  Transactions: 'Transações',
  Goals: 'Metas',
  Wealth: 'Patrimônio',
  Profile: 'Perfil',
};

const tabLabels: Partial<Record<keyof RootTabParamList, string>> = {
  Home: 'Home',
  Transactions: 'Transações',
  Accounts: 'Contas',
  Reports: 'Relatórios',
  More: 'Mais',
};

const visibleTabs: Array<keyof RootTabParamList> = [
  'Home',
  'Transactions',
  'Accounts',
  'Reports',
  'More',
];

function CustomTabBar({
  state,
  descriptors,
  navigation,
  onHeightChange,
}: BottomTabBarProps & { onHeightChange: (height: number) => void }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const routes = state.routes.filter((route) =>
    visibleTabs.includes(route.name as keyof RootTabParamList),
  );

  return (
    <View
      onLayout={(event) => {
        onHeightChange(event.nativeEvent.layout.height);
      }}
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {routes.map((route) => {
        const routeIndex = state.routes.findIndex((item) => item.key === route.key);
        const isFocused = state.index === routeIndex;
        const routeName = route.name as keyof RootTabParamList;
        const descriptor = descriptors[route.key];
        const label =
          typeof descriptor.options.tabBarLabel === 'string'
            ? descriptor.options.tabBarLabel
            : tabLabels[routeName] ?? descriptor.options.title ?? route.name;
        const icons = tabIcons[routeName];
        const iconName = isFocused ? icons.focused : icons.outline;
        const color = isFocused ? theme.colors.accent : theme.colors.textMuted;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            onLongPress={() =>
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              })
            }
            style={styles.tabItem}
          >
            <Ionicons name={iconName} size={24} color={color} />
            <AppText
              variant="caption"
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: isFocused ? '700' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RootTabs() {
  const [tabBarHeight, setTabBarHeight] = useState(0);

  return (
    <FloatingActionButtonHost tabBarHeight={tabBarHeight}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} onHeightChange={setTabBarHeight} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: tabTitles.Home, tabBarLabel: tabLabels.Home }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: tabTitles.Notifications }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{ title: tabTitles.Transactions, tabBarLabel: tabLabels.Transactions }}
        />
        <Tab.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{ title: tabTitles.Accounts, tabBarLabel: tabLabels.Accounts }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: tabTitles.Reports, tabBarLabel: tabLabels.Reports }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{ title: tabTitles.More, tabBarLabel: tabLabels.More }}
        />
        <Tab.Screen name="CreditCards" component={CreditCardsScreen} options={{ title: tabTitles.CreditCards }} />
        <Tab.Screen name="Investments" component={InvestmentsScreen} options={{ title: tabTitles.Investments }} />
        <Tab.Screen
          name="MonthlyClosing"
          component={MonthlyClosingScreen}
          options={{ title: tabTitles.MonthlyClosing }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: tabTitles.Settings }} />
        <Tab.Screen
          name="Subscriptions"
          component={SubscriptionsScreen}
          options={{ title: tabTitles.Subscriptions }}
        />
        <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: tabTitles.Goals }} />
        <Tab.Screen name="Wealth" component={WealthScreen} options={{ title: tabTitles.Wealth }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: tabTitles.Profile }} />
      </Tab.Navigator>
    </FloatingActionButtonHost>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: TAB_BAR_BASE_HEIGHT - 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});
