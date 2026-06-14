import { useObservabilitySnapshot } from '../hooks/useObservabilitySnapshot';

export function ObservabilityPanel() {
  const snapshot = useObservabilitySnapshot();
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">Observabilidade (debug)</summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Métricas</h3>
          <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
{JSON.stringify(snapshot.metrics, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Últimos logs</h3>
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
{snapshot.logs.slice(-6).map((item) => JSON.stringify(item)).join('\n') || 'Sem logs ainda.'}
          </pre>
        </div>
      </div>
    </details>
  );
}
