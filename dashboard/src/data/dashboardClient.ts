import type { DashboardClient } from './types';
import { MockDashboardClient } from './mockDashboardClient';

// Ponto único de troca mock -> API real.
// Migração futura: ler import.meta.env.VITE_API_BASE_URL; se definido,
// retornar `new HttpDashboardClient(baseUrl)` (mesma interface). Nenhum
// componente ou hook muda — só esta função.
export function getDashboardClient(): DashboardClient {
  return new MockDashboardClient();
}
