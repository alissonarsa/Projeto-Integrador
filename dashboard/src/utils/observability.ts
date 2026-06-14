export interface StructuredLog {
  ts: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  page?: string;
  requestId?: string;
  meta?: Record<string, unknown>;
}

export interface MetricsSnapshot {
  fetchErrors: number;
  pageRenderMs: Record<string, number>;
  alertsRendered: number;
}

declare global {
  interface Window {
    __HORTA_OBS__?: {
      logs: StructuredLog[];
      metrics: MetricsSnapshot;
    };
  }
}

const store = {
  logs: [] as StructuredLog[],
  metrics: {
    fetchErrors: 0,
    pageRenderMs: {} as Record<string, number>,
    alertsRendered: 0
  }
};

function emit(log: StructuredLog): void {
  store.logs.push(log);
  if (store.logs.length > 100) store.logs.shift();
  if (typeof window !== 'undefined') {
    window.__HORTA_OBS__ = { logs: [...store.logs], metrics: { ...store.metrics, pageRenderMs: { ...store.metrics.pageRenderMs } } };
    window.dispatchEvent(new CustomEvent('horta-observability:update'));
  }
  const line = `[horta-observability] ${JSON.stringify(log)}`;
  if (log.level === 'error') console.error(line);
  else if (log.level === 'warn') console.warn(line);
  else console.info(line);
}

export function newRequestId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function logInfo(event: string, meta: Record<string, unknown> = {}, page?: string, requestId?: string): void {
  emit({ ts: new Date().toISOString(), level: 'info', event, meta, page, requestId });
}

export function logWarn(event: string, meta: Record<string, unknown> = {}, page?: string, requestId?: string): void {
  emit({ ts: new Date().toISOString(), level: 'warn', event, meta, page, requestId });
}

export function logError(event: string, meta: Record<string, unknown> = {}, page?: string, requestId?: string): void {
  store.metrics.fetchErrors += 1;
  emit({ ts: new Date().toISOString(), level: 'error', event, meta, page, requestId });
}

export function recordPageRender(page: string, durationMs: number): void {
  store.metrics.pageRenderMs[page] = Math.round(durationMs);
  logInfo('page.render', { durationMs: Math.round(durationMs) }, page);
}

export function recordAlertsRendered(count: number): void {
  store.metrics.alertsRendered = count;
  logInfo('alerts.rendered', { count }, 'alertas');
}

export function getObservabilitySnapshot(): { logs: StructuredLog[]; metrics: MetricsSnapshot } {
  return {
    logs: [...store.logs],
    metrics: { ...store.metrics, pageRenderMs: { ...store.metrics.pageRenderMs } }
  };
}

export function resetObservability(): void {
  store.logs.length = 0;
  store.metrics.fetchErrors = 0;
  store.metrics.alertsRendered = 0;
  store.metrics.pageRenderMs = {};
}
