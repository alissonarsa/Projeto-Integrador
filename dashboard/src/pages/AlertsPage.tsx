import { useEffect, useMemo, useState } from 'react';
import type { Alerta, DashboardClient } from '../data/types';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { formatarDataHora, isWithinHours } from '../utils/tempo';
import { recordAlertsRendered } from '../utils/observability';
import { usePageRenderMetric } from '../hooks/usePageRenderMetric';

interface Props {
  client: DashboardClient;
}

export function AlertsPage({ client }: Props) {
  usePageRenderMetric('alertas');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canteiroFiltro, setCanteiroFiltro] = useState('todos');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [periodo, setPeriodo] = useState<'24h' | '7d' | '30d'>('7d');

  async function carregar() {
    setStatus('loading');
    setError(null);
    try {
      const dados = await client.getAlertas();
      setAlertas(dados);
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar alertas');
      setStatus('error');
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const filtrados = useMemo(() => {
    const horas = periodo === '24h' ? 24 : periodo === '7d' ? 24 * 7 : 24 * 30;
    return alertas.filter((item) => {
      const byCanteiro = canteiroFiltro === 'todos' || item.canteiroId === canteiroFiltro;
      const byTipo = tipoFiltro === 'todos' || item.tipo === tipoFiltro;
      const byPeriodo = isWithinHours(item.timestamp, horas);
      return byCanteiro && byTipo && byPeriodo;
    });
  }, [alertas, canteiroFiltro, tipoFiltro, periodo]);

  useEffect(() => {
    if (status === 'success') recordAlertsRendered(filtrados.length);
  }, [status, filtrados.length]);

  if (status === 'loading') {
    return <LoadingState label="Carregando alertas e aplicando filtros…" />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Falha ao carregar alertas"
        description={error ?? 'A página de alertas não conseguiu recuperar os dados mockados.'}
        action={
          <button type="button" onClick={() => void carregar()} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">WF-03 — Alertas</h2>
        <p className="mt-1 text-sm text-slate-500">Filtros por canteiro, tipo e período. Regra concreta ativa: umidade do solo abaixo de 30%.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Canteiro</span>
            <select value={canteiroFiltro} onChange={(e) => setCanteiroFiltro(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="todos">Todos</option>
              {Array.from(new Map(alertas.map((item) => [item.canteiroId, item.canteiroNome])).entries()).map(([id, nome]) => (
                <option key={id} value={id}>{nome}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tipo</span>
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="todos">Todos</option>
              <option value="umidade-critica">Umidade crítica</option>
              <option value="sensor-offline">Sensor offline</option>
              <option value="leitura-suspeita">Leitura suspeita</option>
              <option value="irrigacao-manual">Irrigação manual</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Período</span>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value as '24h' | '7d' | '30d')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </label>
        </div>
      </section>

      {filtrados.length === 0 ? (
        <EmptyState title="Nenhum alerta encontrado" description="A combinação de filtros atual não retornou alertas." />
      ) : (
        <section className="grid gap-4">
          {filtrados.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.tipo}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{item.canteiroNome}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.resolvido ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'}`}>
                  {item.resolvido ? 'Resolvido' : 'Ativo'}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{item.mensagem}</p>
              <p className="mt-2 text-xs text-slate-500">Registrado em {formatarDataHora(item.timestamp)}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
