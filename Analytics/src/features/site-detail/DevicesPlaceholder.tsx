import { Card } from '@/components/ui/Card';

// Dispositivos está FORA do escopo congelado do MVP (como geo/eventos).
// Slot visível e marcado; promover exige dimensão dedicada no GA4, como Origem de tráfego.
export function DevicesPlaceholder() {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Dispositivos</h2>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
          Fora do MVP
        </span>
      </div>
      <Card className="px-4 py-6 text-sm text-zinc-500">
        Quebra por dispositivo (mobile / desktop / tablet) entra em uma fase posterior — exige uma
        dimensão dedicada no GA4, como fizemos com Origem de tráfego.
      </Card>
    </section>
  );
}
