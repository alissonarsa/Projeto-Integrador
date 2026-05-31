import type { DashboardClient } from '../data/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { CanteiroCard } from '../components/CanteiroCard';
import { ConnectionBanner } from '../components/ConnectionBanner';

interface Props {
  client?: DashboardClient;
  pollMs?: number;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}

export function Dashboard({ client, pollMs }: Props) {
  const { status, snapshot, lastUpdated, connectionLost, refetch } = useDashboardData(client, pollMs);

  if (status === 'loading' && !snapshot) {
    return <SkeletonGrid />;
  }

  if (status === 'error' && !snapshot) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-gray-700">Não foi possível conectar ao servidor.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const canteiros = snapshot?.canteiros ?? [];
  if (canteiros.length === 0) {
    return <p className="p-10 text-center text-gray-500">Nenhum canteiro cadastrado.</p>;
  }

  const leituraDe = (id: string) => snapshot?.leituras.find((l) => l.canteiroId === id);
  const horaSync = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h1 className="text-lg font-semibold">Horta Inteligente</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Última sincronização: {horaSync}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100"
          >
            Atualizar
          </button>
        </div>
      </header>

      {connectionLost && <ConnectionBanner ultimaAtualizacao={lastUpdated} />}

      <main className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {canteiros.map((c) => (
          <CanteiroCard key={c.id} canteiro={c} leitura={leituraDe(c.id)} />
        ))}
      </main>
    </div>
  );
}
