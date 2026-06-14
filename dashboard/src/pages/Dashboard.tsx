import { useMemo } from 'react';
import type { DashboardClient } from '../data/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { CanteiroCard } from '../components/CanteiroCard';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { KpiCard } from '../components/KpiCard';
import { Sparkline } from '../components/Sparkline';
import { usePageRenderMetric } from '../hooks/usePageRenderMetric';

interface Props {
  client?: DashboardClient;
  pollMs?: number;
}

export function Dashboard({ client, pollMs }: Props) {
  usePageRenderMetric('principal');
  const { status, snapshot, resumoSemanal, lastUpdated, connectionLost, refetch } = useDashboardData(client, pollMs);

  const canteiros = snapshot?.canteiros ?? [];
  const leituras = snapshot?.leituras ?? [];

  const series = useMemo(() => {
    const temperatura = leituras.map((item) => item.temperatura);
    const umidade = leituras.map((item) => item.umidadeSolo);
    const luminosidade = leituras.map((item) => item.luminosidade);
    return { temperatura, umidade, luminosidade };
  }, [leituras]);

  const litrosSemana = resumoSemanal.slice(-1)[0]?.litrosTotal ?? 0;
  const irrigacoesSemana = resumoSemanal.slice(-1)[0]?.irrigacoesTotal ?? 0;
  const alertasAtivos = leituras.filter((item) => item.umidadeSolo !== null && item.umidadeSolo < 30).length;
  const sensoresOff = leituras.filter((item) => item.sensorOffline).length;

  if (status === 'loading' && !snapshot) {
    return <LoadingState label="Carregando status dos canteiros, gráficos e relatório semanal…" />;
  }

  if (status === 'error' && !snapshot) {
    return (
      <ErrorState
        title="Não foi possível conectar ao servidor"
        description="A tela principal não conseguiu carregar os dados mockados. Tente novamente para reexecutar o fetch."
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  if (canteiros.length === 0) {
    return (
      <EmptyState
        title="Nenhum canteiro cadastrado"
        description="Cadastre ao menos um canteiro para começar a visualizar leituras, alertas e relatórios."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">WF-01 — Dashboard Geral</h2>
          <p className="text-sm text-slate-500">
            Gráficos das variáveis principais, status atual dos canteiros e relatório agregado mínimo.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            Última sincronização:{' '}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100"
          >
            Atualizar
          </button>
        </div>
      </section>

      {connectionLost ? <ConnectionBanner ultimaAtualizacao={lastUpdated} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Litros na semana" value={`${litrosSemana.toFixed(1)} L`} helper="Relatório agregado mockado" />
        <KpiCard title="Irrigações na semana" value={`${irrigacoesSemana}`} helper="Eventos automáticos + manuais" />
        <KpiCard title="Alertas ativos" value={`${alertasAtivos}`} helper="Umidade crítica abaixo de 30%" />
        <KpiCard title="Sensores offline" value={`${sensoresOff}`} helper="Com leitura parcial ou ausente" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Sparkline values={series.temperatura} label="Temperatura (24h)" unit="°C" />
        <Sparkline values={series.umidade} label="Umidade do solo (24h)" unit="%" />
        <Sparkline values={series.luminosidade} label="Luminosidade (24h)" unit=" lux" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {canteiros.map((canteiro) => (
          <CanteiroCard
            key={canteiro.id}
            canteiro={canteiro}
            leitura={leituras.find((item) => item.canteiroId === canteiro.id)}
          />
        ))}
      </section>
    </div>
  );
}
