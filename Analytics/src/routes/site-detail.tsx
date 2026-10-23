import { AppShell } from '@/components/layout/AppShell';
import { SiteDetailPage } from '@/features/site-detail/SiteDetailPage';

export default function SiteDetailRoute() {
  return (
    <AppShell>
      <SiteDetailPage />
    </AppShell>
  );
}
