import { AppShell } from '@/components/layout/AppShell';
import { SitesPage } from '@/features/sites/SitesPage';

export default function SitesRoute() {
  return (
    <AppShell>
      <SitesPage />
    </AppShell>
  );
}
