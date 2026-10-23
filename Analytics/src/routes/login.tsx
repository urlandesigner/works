import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useAuth } from '@/hooks/useAuth';
import { USE_MOCKS } from '@/config';

export default function LoginRoute() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState(USE_MOCKS ? 'admin@udlabs.local' : '');
  const [password, setPassword] = useState(USE_MOCKS ? 'udlabs' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_minmax(320px,420px)]">
          <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.08),transparent_42%)] px-6 py-8 sm:px-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                UD Labs
              </div>
              <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Acompanhe o portfólio inteiro e descubra onde precisa agir agora.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Painel interno para leitura rápida do estado analítico dos sites da UD Labs, com foco em sinais, quedas
                e saúde de sincronização do GA4.
              </p>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
              {[
                ['Lente padrão', 'Últimos 7 dias contra os 7 anteriores'],
                ['Fonte única', 'GA4 como base do MVP e sync via Supabase'],
                ['Prioridade', 'Técnicos primeiro, depois quedas e crescimentos'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">{label}</p>
                  <p className="mt-2 text-sm text-zinc-700">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Entrar</h2>
            <p className="mt-2 text-sm text-zinc-500">A autenticação existe apenas para proteger o acesso ao painel.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@udlabs.com"
                autoFocus
                required
              />
              <FormField
                label="Senha"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                required
              />

              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <Button type="submit" variant="primary" disabled={loading} className="w-full justify-center">
                {loading ? 'Entrando…' : 'Acessar dashboard'}
              </Button>
            </form>

            {USE_MOCKS ? (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
                Em modo mock, qualquer email e senha funcionam para liberar a navegação local.
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
                Use aqui o usuário criado em <code>Authentication → Users</code> no Supabase.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
