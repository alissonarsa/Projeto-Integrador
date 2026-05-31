import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardClient, DashboardSnapshot } from '../data/types';
import { getDashboardClient } from '../data/dashboardClient';

export type DashboardStatus = 'loading' | 'success' | 'error';

export interface UseDashboardData {
  status: DashboardStatus;
  snapshot: DashboardSnapshot | null;
  lastUpdated: Date | null;
  connectionLost: boolean;
  error: Error | null;
  refetch: () => void;
}

const POLL_PADRAO_MS = 30_000;

export function useDashboardData(
  clientArg?: DashboardClient,
  pollMs: number = POLL_PADRAO_MS,
): UseDashboardData {
  // Memoiza o client: se nenhum for passado, cria o provider padrão uma vez.
  const client = useMemo(() => clientArg ?? getDashboardClient(), [clientArg]);

  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const temDados = useRef(false);
  // Sequência de requisições: garante que só a resposta mais recente aplica
  // estado. Sem isso, polling e "Atualizar" manual concorrentes podem aplicar
  // resultados fora de ordem (banner "Sem conexão" piscando sobre dados frescos).
  const requestId = useRef(0);

  const buscar = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const [canteiros, leituras] = await Promise.all([
        client.getCanteiros(),
        client.getLeiturasUltimas(),
      ]);
      if (id !== requestId.current) return; // resposta obsoleta — ignora
      setSnapshot({ canteiros, leituras });
      setLastUpdated(new Date());
      setConnectionLost(false);
      setError(null);
      setStatus('success');
      temDados.current = true;
    } catch (e) {
      if (id !== requestId.current) return; // resposta obsoleta — ignora
      const err = e instanceof Error ? e : new Error(String(e));
      if (temDados.current) {
        // E2: polling falhou — mantém os últimos dados e sinaliza sem conexão.
        setConnectionLost(true);
      } else {
        // E1: falha na carga inicial.
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

  return { status, snapshot, lastUpdated, connectionLost, error, refetch: buscar };
}
