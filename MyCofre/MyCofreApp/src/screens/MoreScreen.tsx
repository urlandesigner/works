import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppHeader, AppScreen, AppText } from '../components';
import type { RootTabParamList } from '../navigation/types';
import { useTheme } from '../theme';

type MoreItem = {
  route: keyof RootTabParamList;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type MoreSection = {
  title: string;
  items: MoreItem[];
};

const sections: MoreSection[] = [
  {
    title: 'Planejamento',
    items: [
      {
        route: 'Goals',
        label: 'Metas',
        description: 'Acompanhe objetivos e progresso.',
        icon: 'flag-outline',
      },
      {
        route: 'Subscriptions',
        label: 'Assinaturas',
        description: 'Veja recorrencias e proximas cobrancas.',
        icon: 'repeat-outline',
      },
      {
        route: 'MonthlyClosing',
        label: 'Fechamento mensal',
        description: 'Consulte snapshots e inicie novos fechamentos.',
        icon: 'calendar-outline',
      },
    ],
  },
  {
    title: 'Patrimonio',
    items: [
      {
        route: 'CreditCards',
        label: 'Cartoes e faturas',
        description: 'Gerencie cartoes, faturas e status.',
        icon: 'card-outline',
      },
      {
        route: 'Investments',
        label: 'Investimentos',
        description: 'Acompanhe carteira e valores atuais.',
        icon: 'trending-up-outline',
      },
      {
        route: 'Wealth',
        label: 'Patrimonio',
        description: 'Analise patrimonio total e composicao.',
        icon: 'pie-chart-outline',
      },
    ],
  },
  {
    title: 'Conta e app',
    items: [
      {
        route: 'Profile',
        label: 'Perfil',
        description: 'Atualize seus dados de conta.',
        icon: 'person-outline',
      },
      {
        route: 'Settings',
        label: 'Configuracoes',
        description: 'Tema, dados locais e sessao.',
        icon: 'settings-outline',
      },
    ],
  },
];

export function MoreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  return (
    <AppScreen scroll>
      <AppHeader title="Mais" />

      {sections.map((section) => (
        <View key={section.title} style={{ marginBottom: theme.spacing.xl }}>
          <AppText variant="label" color="secondary" style={{ marginBottom: theme.spacing.md }}>
            {section.title}
          </AppText>

          <View style={styles.sectionList}>
            {section.items.map((item) => (
              <Pressable key={item.route} onPress={() => navigation.navigate(item.route)}>
                <AppCard style={styles.itemCard}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: theme.colors.accentMuted,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  >
                    <Ionicons name={item.icon} size={20} color={theme.colors.accent} />
                  </View>

                  <View style={styles.itemContent}>
                    <AppText variant="bodySmall">{item.label}</AppText>
                    <AppText
                      variant="caption"
                      color="secondary"
                      style={{ marginTop: theme.spacing.xxs }}
                    >
                      {item.description}
                    </AppText>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </AppCard>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionList: {
    gap: 10,
  },
  itemCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  iconWrap: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  itemContent: {
    flex: 1,
  },
});
