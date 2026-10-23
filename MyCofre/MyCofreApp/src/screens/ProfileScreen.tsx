import { Image, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { fetchProfileRow, upsertProfileRow, type ProfileRow } from '../shared/supabase/profilesRepo';
import { useTheme } from '../theme';

function displayNameFromUserEmail(email: string | undefined): string {
  const local = email?.split('@')[0]?.trim();
  return local || 'Usuario';
}

function displayNameFromSources(
  row: ProfileRow | null,
  metadata: Record<string, unknown> | undefined,
  email: string | undefined,
): string {
  const rowName = row?.full_name?.trim();
  if (rowName) return rowName;

  const metadataFullName = metadata?.full_name;
  if (typeof metadataFullName === 'string' && metadataFullName.trim()) {
    return metadataFullName.trim();
  }

  const metadataName = metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }

  return displayNameFromUserEmail(email);
}

function phoneFromSources(
  row: ProfileRow | null,
  metadata: Record<string, unknown> | undefined,
): string {
  const rowPhone = row?.phone?.trim();
  if (rowPhone) return rowPhone;

  const metadataPhone = metadata?.phone;
  if (typeof metadataPhone === 'string') {
    return metadataPhone;
  }

  return '';
}

function avatarFromSources(
  row: ProfileRow | null,
  metadata: Record<string, unknown> | undefined,
): string | null {
  const rowAvatar = row?.avatar_url?.trim();
  if (rowAvatar) return rowAvatar;

  const metadataAvatar = metadata?.avatar_url;
  if (typeof metadataAvatar === 'string' && metadataAvatar.trim()) {
    return metadataAvatar.trim();
  }

  return null;
}

export function ProfileScreen() {
  const { theme } = useTheme();
  const { user, session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileRow, setProfileRow] = useState<ProfileRow | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user?.id) {
        if (!cancelled) {
          setLoading(false);
          setError('Usuario nao autenticado.');
        }
        return;
      }

      const client = getSupabaseMobileClient();
      if (!client) {
        if (!cancelled) {
          setLoading(false);
          setError('Supabase nao configurado.');
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const { data, error: fetchError } = await fetchProfileRow(client, user.id);

      if (cancelled) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const metadata = user.user_metadata as Record<string, unknown> | undefined;
      setProfileRow(data);
      setName(displayNameFromSources(data, metadata, user.email));
      setEmail(user.email ?? '');
      setPhone(phoneFromSources(data, metadata));
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token, user]);

  const avatarUrl = useMemo(
    () =>
      avatarFromSources(
        profileRow,
        user?.user_metadata as Record<string, unknown> | undefined,
      ),
    [profileRow, user?.user_metadata],
  );

  const avatarLetter = (name.trim() || displayNameFromUserEmail(email)).charAt(0).toUpperCase();

  async function handleSave() {
    if (!user?.id) {
      setError('Usuario nao autenticado.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Informe seu nome.');
      return;
    }

    if (!trimmedEmail) {
      setError('Informe seu e-mail.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase nao configurado.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const { error: profileError } = await upsertProfileRow(client, user.id, {
      full_name: trimmedName,
      phone: trimmedPhone,
    });

    if (profileError) {
      setSaving(false);
      setError(profileError.message);
      return;
    }

    const authPayload: {
      data: Record<string, string>;
      email?: string;
    } = {
      data: {
        full_name: trimmedName,
        phone: trimmedPhone,
      },
    };

    if (trimmedEmail !== (user.email ?? '')) {
      authPayload.email = trimmedEmail;
    }

    const { data: updateData, error: authError } = await client.auth.updateUser(authPayload);

    setSaving(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    const nextRow: ProfileRow = {
      id: user.id,
      full_name: trimmedName,
      phone: trimmedPhone,
      avatar_url: profileRow?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    };

    setProfileRow(nextRow);
    setName(trimmedName);
    setPhone(trimmedPhone);
    setEmail(updateData.user?.email ?? trimmedEmail);
    setSuccessMessage('Perfil atualizado com sucesso.');
  }

    if (loading) {
      return (
        <AppScreen scroll>
        <AppHeader eyebrow="Conta" title="Perfil" />
        <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.lg }}>
          Carregando perfil...
        </AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <AppHeader eyebrow="Conta" title="Perfil" />

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

      <AppCard style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl, ...theme.shadows.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginRight: theme.spacing.lg,
              }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: theme.colors.track,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.lg,
              }}
            >
              <AppText variant="title2" color="accent">
                {avatarLetter || 'U'}
              </AppText>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="title3">{name || 'Usuario'}</AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xxs }}>
              {email || 'Sem e-mail'}
            </AppText>
            {phone ? (
              <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                {phone}
              </AppText>
            ) : null}
          </View>
        </View>
      </AppCard>

      <AppText variant="overline" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Dados da conta
      </AppText>
      <AppCard style={{ marginBottom: theme.spacing.sectionGap, ...theme.shadows.sm }}>
        <AppInput
          label="Nome"
          placeholder="Como prefere ser chamado"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={{ marginBottom: theme.spacing.md }}
        />
        <AppInput
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={{ marginBottom: theme.spacing.md }}
        />
        <AppInput
          label="E-mail"
          placeholder="voce@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.lg }}>
          Se o e-mail for alterado, o Supabase pode exigir confirmacao da nova conta antes da troca ser concluida.
        </AppText>

        <View style={{ marginTop: theme.spacing.xl }}>
          <AppButton
            title={saving ? 'Salvando...' : 'Salvar alteracoes'}
            onPress={() => void handleSave()}
            loading={saving}
            disabled={saving}
            fullWidth
          />
        </View>
      </AppCard>

      <AppText variant="overline" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Foto
      </AppText>
      <AppCard style={{ ...theme.shadows.sm }}>
        <AppText variant="bodySmall" color="secondary">
          O app ja mostra `avatar_url` real quando ele existir no perfil ou no Auth. Upload e troca
          de foto ainda nao estao implementados nesta fase.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}
