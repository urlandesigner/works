import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { SiteCreateForm } from './SiteCreateForm';

export function SiteCreatePage() {
  return (
    <>
      <Topbar title="Novo site" subtitle="Cadastre um site e conecte o GA4" />
      <div className="max-w-xl">
        <Card className="p-6">
          <SiteCreateForm />
        </Card>
      </div>
    </>
  );
}
