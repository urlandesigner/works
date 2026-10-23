import { AppShell } from '@/components/layout/AppShell';
import { SiteEditPage } from '@/features/sites/SiteEditPage';

export default function SiteEditRoute() {
  return (
    <AppShell>
      <SiteEditPage />
    </AppShell>
  );
}
