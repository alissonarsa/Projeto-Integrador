import { useEffect, useMemo, useState } from 'react';
import type { DashboardClient, Leitura } from '../data/types';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { formatarDataHora } from '../utils/tempo';
import { toCsv } from '../utils/csv';
import { usePageRenderMetric } from '../hooks/usePageRenderMetric';

interface Props {
  client: DashboardClient;
}

const PAGE_SIZE = 12;

export function HistoryPage({ client }: Props) {
  usePageRenderMetric('historico');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [historico, setHistorico] = useState<Leitura[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canteiroFiltro, setCanteiroFiltro] = useState('todos');
  const [visiveis, setVisiveis] = useState(PAGE_SIZE);

  async function carregar() {
    setStatus('loading');
    setError(null);
    try {
      const dados = await client.getHistoricoLeituras();
      setHistorico(dados);
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar histórico');
      setStatus('error');
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const filtrado = useMemo(() => {
    return historico.filter((item) => canteiroFiltro === 'todos' || item.canteiroId === canteiroFiltro);
  }, [historico, canteiroFiltro]);

  const pagina = filtrado.slice(0, visiveis);

  function exportarCsv() {
    const csv = toCsv(
      filtrado.map((item) => ({
        canteiroId: item.canteiroId,
        timestamp: item.timestamp,
        temperatura: item.temperatura,
        umidadeAr: item.umidadeAr,
        umidadeSolo: item.umidadeSolo,
        luminosidade: item.luminosidade,
        irrigacao: item.irrigacao,
        suspeita: item.suspeita ? 'sim' : 'nao'
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historico-horta.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === 'loading') return <LoadingState label="Carregando histórico e montando paginação…" />;
  if (status === 'error') {
    return (
      <ErrorState
        title="Falha ao carregar histórico"
        description={error ?? 'Não foi possível buscar leituras passadas.'}
        action={<button type="button" onClick={() => void carregar()} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Tentar novamente</button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">WF-02 — Histórico de leituras</h2>
            <p className="mt-1 text-sm text-slate-500">Tabela paginada, bordas destacadas e exportação CSV.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Canteiro</span>
              <select value={canteiroFiltro} onChange={(e) => setCanteiroFiltro(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="todos">Todos</option>
                {Array.from(new Set(historico.map((item) => item.canteiroId))).map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={exportarCsv} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white">Exportar CSV</button>
          </div>
        </div>
      </section>

      {filtrado.length === 0 ? (
        <EmptyState title="Nenhuma leitura encontrada" description="Tente outro canteiro ou aguarde novas leituras mockadas." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Canteiro', 'Data/hora', 'Temp', 'U. ar', 'U. solo', 'Lux', 'Irrigação', 'Flags'].map((item) => (
                    <th key={item} className="px-4 py-3 text-left font-semibold text-slate-700">{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagina.map((item) => (
                  <tr key={item.id} className={item.suspeita ? 'bg-red-50/60' : ''}>
                    <td className="px-4 py-3">{item.canteiroId}</td>
                    <td className="px-4 py-3">{formatarDataHora(item.timestamp)}</td>
                    <td className="px-4 py-3">{item.temperatura ?? '—'}</td>
                    <td className="px-4 py-3">{item.umidadeAr ?? '—'}</td>
                    <td className="px-4 py-3">{item.umidadeSolo ?? '—'}</td>
                    <td className="px-4 py-3">{item.luminosidade ?? '—'}</td>
                    <td className="px-4 py-3">{item.irrigacao}</td>
                    <td className="px-4 py-3">{item.sensorOffline ? 'offline' : item.parcial ? 'parcial' : item.suspeita ? 'suspeita' : 'ok'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visiveis < filtrado.length ? (
            <div className="border-t border-slate-200 p-4">
              <button type="button" onClick={() => setVisiveis((current) => current + PAGE_SIZE)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Carregar mais
              </button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
