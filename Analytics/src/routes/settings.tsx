import { AppShell } from '@/components/layout/AppShell';
import { SettingsPage } from '@/features/settings/SettingsPage';

export default function SettingsRoute() {
  return (
    <AppShell>
      <SettingsPage />
    </AppShell>
  );
}
