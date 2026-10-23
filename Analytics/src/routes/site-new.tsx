import { AppShell } from '@/components/layout/AppShell';
import { SiteCreatePage } from '@/features/sites/SiteCreatePage';

export default function SiteNewRoute() {
  return (
    <AppShell>
      <SiteCreatePage />
    </AppShell>
  );
}
