import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppButton, AppInput, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { useTheme } from '../theme';

export function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSignIn() {
    setMessage(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setMessage(error.message);
    }
  }

  async function handleSignUp() {
    setMessage(null);
    setBusy(true);
    const { error } = await signUp(email, password);
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Conta criada. Verifique seu e-mail se a confirmação estiver ativa.');
  }

  return (
    <AppScreen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.block}>
          <AppText variant="title1" style={styles.title}>
            MyCofre
          </AppText>
          <AppText variant="body" color="secondary" style={styles.subtitle}>
            Entre ou crie uma conta para continuar.
          </AppText>

          {!configured ? (
            <AppText variant="caption" color="danger" style={styles.hint}>
              Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env e reinicie o Expo.
            </AppText>
          ) : null}

          {message ? (
            <AppText variant="caption" color="accent" style={styles.hint}>
              {message}
            </AppText>
          ) : null}

          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!busy}
          />
          <AppInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            editable={!busy}
          />

          <View style={[styles.actions, { gap: theme.spacing.md }]}>
            <AppButton
              title="Entrar"
              onPress={() => void handleSignIn()}
              loading={busy}
              fullWidth
              disabled={!configured}
            />
            <AppButton
              title="Criar conta"
              variant="secondary"
              onPress={() => void handleSignUp()}
              loading={busy}
              fullWidth
              disabled={!configured}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flexGrow: 1,
    width: '100%',
  },
  block: {
    width: '100%',
    paddingTop: 8,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  hint: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 8,
    width: '100%',
  },
});
