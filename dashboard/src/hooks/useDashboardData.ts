import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardClient, DashboardSnapshot, ResumoSemanal } from '../data/types';
import { getDashboardClient } from '../data/dashboardClient';

export type DashboardStatus = 'loading' | 'success' | 'error';

export interface UseDashboardData {
  status: DashboardStatus;
  snapshot: DashboardSnapshot | null;
  resumoSemanal: ResumoSemanal[];
  lastUpdated: Date | null;
  connectionLost: boolean;
  error: Error | null;
  refetch: () => void;
}

const POLL_PADRAO_MS = 30_000;

export function useDashboardData(clientArg?: DashboardClient, pollMs: number = POLL_PADRAO_MS): UseDashboardData {
  const client = useMemo(() => clientArg ?? getDashboardClient(), [clientArg]);
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [resumoSemanal, setResumoSemanal] = useState<ResumoSemanal[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const temDados = useRef(false);
  const requestId = useRef(0);

  const buscar = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [canteiros, leituras, resumo] = await Promise.all([
        client.getCanteiros(),
        client.getLeiturasUltimas(),
        client.getResumoSemanal()
      ]);
      if (id !== requestId.current) return;
      setSnapshot({ canteiros, leituras });
      setResumoSemanal(resumo);
      setLastUpdated(new Date());
      setConnectionLost(false);
      setError(null);
      setStatus('success');
      temDados.current = true;
    } catch (e) {
      if (id !== requestId.current) return;
      const err = e instanceof Error ? e : new Error(String(e));
      if (temDados.current) {
        setConnectionLost(true);
      } else {
        setError(err);
        setStatus('error');
      }
    }
  }, [client]);

  useEffect(() => {
    void buscar();
    const id = setInterval(() => void buscar(), pollMs);
    return () => clearInterval(id);
  }, [buscar, pollMs]);

  return { status, snapshot, resumoSemanal, lastUpdated, connectionLost, error, refetch: buscar };
}
