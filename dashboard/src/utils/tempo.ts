export const LIMITE_DADOS_RECENTES_MIN = 15;

export function minutosDesde(timestamp: string, now: number = Date.now()): number {
  return Math.floor((now - new Date(timestamp).getTime()) / 60_000);
}
