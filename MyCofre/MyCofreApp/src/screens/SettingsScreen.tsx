import { Alert, Pressable, Switch, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppButton, AppCard, AppHeader, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import type { RootTabParamList } from '../navigation/types';
import { clearStoredColorScheme } from '../theme/themeStorage';
import { useTheme } from '../theme';

function sessionLabel(hasSession: boolean): string {
  return hasSession ? 'Sessao ativa' : 'Sessao indisponivel';
}

export function SettingsScreen() {
  const { theme, colorScheme, setColorScheme } = useTheme();
  const { user, session, signOut } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const [busyAction, setBusyAction] = useState<'none' | 'reset' | 'signout'>('none');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDark = colorScheme === 'dark';
  const sessionText = useMemo(() => sessionLabel(Boolean(session)), [session]);

  function handleSignOut() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair da conta neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyAction('signout');
            setError(null);
            setSuccessMessage(null);

            const result = await signOut();

            setBusyAction('none');

            if (result.error) {
              setError(result.error.message);
              return;
            }

            setSuccessMessage('Sessao encerrada com sucesso.');
          })();
        },
      },
    ]);
  }

  async function handleResetLocalPreferences() {
    setBusyAction('reset');
    setError(null);
    setSuccessMessage(null);

    await clearStoredColorScheme();
    setColorScheme('dark');

    setBusyAction('none');
    setSuccessMessage('Preferencias locais de aparencia foram redefinidas.');
  }

  return (
    <AppScreen scroll>
      <AppHeader eyebrow="App" title="Configuracoes" />

      {successMessage ? (
        <AppText variant="bodySmall" color="success" style={{ marginTop: theme.spacing.lg }}>
          {successMessage}
        </AppText>
      ) : null}

      {error ? (
        <AppText variant="bodySmall" color="danger" style={{ marginTop: theme.spacing.lg }}>
          {error}
        </AppText>
      ) : null}

      <AppText variant="overline" color="secondary" style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm }}>
        Aparencia
      </AppText>
      <AppCard style={{ marginBottom: theme.spacing.sectionGap, ...theme.shadows.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: theme.spacing.lg }}>
            <AppText variant="body">Modo escuro</AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
              A preferencia continua salva neste aparelho e vale para todo o app.
            </AppText>
          </View>
          <Switch
            accessibilityLabel="Ativar modo escuro"
            value={isDark}
            onValueChange={(on) => setColorScheme(on ? 'dark' : 'light')}
            trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
            thumbColor={isDark ? theme.colors.accent : '#FFFFFF'}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <AppText variant="caption" color="secondary">
            Tema atual: {isDark ? 'Escuro' : 'Claro'}
          </AppText>
        </View>
      </AppCard>

      <AppText variant="overline" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Conta
      </AppText>
      <AppCard style={{ marginBottom: theme.spacing.sectionGap, ...theme.shadows.sm }}>
        <View style={{ gap: theme.spacing.md }}>
          <View>
            <AppText variant="caption" color="secondary">
              E-mail
            </AppText>
            <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
              {user?.email ?? 'Sem e-mail'}
            </AppText>
          </View>

          <View>
            <AppText variant="caption" color="secondary">
              Sessao
            </AppText>
            <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
              {sessionText}
            </AppText>
          </View>

          <AppButton
            title="Abrir perfil"
            variant="secondary"
            onPress={() => navigation.navigate('Profile')}
            fullWidth
          />
        </View>
      </AppCard>

      <AppText variant="overline" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Dados
      </AppText>
      <AppCard style={{ marginBottom: theme.spacing.sectionGap, ...theme.shadows.sm }}>
        <View style={{ gap: theme.spacing.lg }}>
          <SettingsActionRow
            title="Importacao futura"
            description="Estrutura preparada para receber importacao segura quando esse fluxo for implementado no mobile."
          />
          <SettingsActionRow
            title="Exportacao futura"
            description="Espaco reservado para exportacao de dados e backup local em fase posterior."
          />
          <View>
            <SettingsActionRow
              title="Reset local seguro"
              description="Hoje redefine apenas preferencias locais ja persistidas neste aparelho, sem tocar nos dados do banco."
            />
            <View style={{ marginTop: theme.spacing.md }}>
              <AppButton
                title={busyAction === 'reset' ? 'Redefinindo...' : 'Redefinir preferencias locais'}
                variant="secondary"
                onPress={() => void handleResetLocalPreferences()}
                loading={busyAction === 'reset'}
                disabled={busyAction !== 'none'}
                fullWidth
              />
            </View>
          </View>
        </View>
      </AppCard>

      <AppText variant="overline" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Sessao
      </AppText>
      <AppCard style={{ ...theme.shadows.sm }}>
        <AppText variant="bodySmall" color="secondary">
          Use esta acao para encerrar a sessao deste aparelho com confirmacao simples.
        </AppText>
        <View style={{ marginTop: theme.spacing.lg }}>
          <AppButton
            title={busyAction === 'signout' ? 'Saindo...' : 'Sair da conta'}
            onPress={handleSignOut}
            loading={busyAction === 'signout'}
            disabled={busyAction !== 'none'}
            fullWidth
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

function SettingsActionRow({ title, description }: { title: string; description: string }) {
  return (
    <View>
      <AppText variant="body">{title}</AppText>
      <AppText variant="caption" color="secondary" style={{ marginTop: 6 }}>
        {description}
      </AppText>
    </View>
  );
}
