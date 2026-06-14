export const LIMITE_DADOS_RECENTES_MIN = 15;

export function minutosDesde(timestamp: string, now: number = Date.now()): number {
  const diffMs = now - new Date(timestamp).getTime();
  return Math.floor(diffMs / 60000);
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isWithinHours(iso: string, hours: number, now: number = Date.now()): boolean {
  return now - new Date(iso).getTime() <= hours * 60 * 60 * 1000;
}
