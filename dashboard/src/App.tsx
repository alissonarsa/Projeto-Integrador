import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { CanteirosPage } from './pages/CanteirosPage';
import { ObservabilityPanel } from './components/ObservabilityPanel';
import { getDashboardClient } from './data/dashboardClient';
import { logInfo } from './utils/observability';

export type AppRoute = 'principal' | 'alertas' | 'historico' | 'canteiros';

const ROUTES: Array<{ key: AppRoute; label: string }> = [
  { key: 'principal', label: 'Principal' },
  { key: 'alertas', label: 'Alertas' },
  { key: 'historico', label: 'Histórico' },
  { key: 'canteiros', label: 'Cadastro de canteiros' }
];

function routeFromHash(): AppRoute {
  const hash = window.location.hash.replace('#', '');
  return ROUTES.some((item) => item.key === hash) ? (hash as AppRoute) : 'principal';
}

export default function App() {
  const client = useMemo(() => getDashboardClient(), []);
  const [route, setRoute] = useState<AppRoute>(() => routeFromHash());

  useEffect(() => {
    const handler = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', handler);
    if (!window.location.hash) window.location.hash = 'principal';
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    logInfo('app.route.changed', { route }, 'app');
  }, [route]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Horta Inteligente</p>
              <h1 className="text-2xl font-bold">Dashboard completo mockado — A1.8</h1>
              <p className="text-sm text-slate-500">
                Dados sintéticos Jan–Jun/2026 · fetch isolado · observabilidade aplicada ao front.
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Baseado na estrutura da A1.7
            </span>
          </div>
          <nav className="flex flex-wrap gap-2">
            {ROUTES.map((item) => {
              const active = item.key === route;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    window.location.hash = item.key;
                    setRoute(item.key);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {route === 'principal' ? <Dashboard client={client} /> : null}
        {route === 'alertas' ? <AlertsPage client={client} /> : null}
        {route === 'historico' ? <HistoryPage client={client} /> : null}
        {route === 'canteiros' ? <CanteirosPage client={client} /> : null}
        <ObservabilityPanel />
      </main>
    </div>
  );
}
