import type { DashboardClient } from './types';

export class HttpDashboardClient implements DashboardClient {
  constructor(private readonly baseUrl: string) {}

  private notImplemented(method: string): never {
    throw new Error(`HttpDashboardClient ainda não implementado (${method}) para esta release mockada. Base: ${this.baseUrl}`);
  }

  getCanteiros() {
    return this.notImplemented('getCanteiros');
  }

  getLeiturasUltimas() {
    return this.notImplemented('getLeiturasUltimas');
  }

  getHistoricoLeituras() {
    return this.notImplemented('getHistoricoLeituras');
  }

  getAlertas() {
    return this.notImplemented('getAlertas');
  }

  getIrrigacoes() {
    return this.notImplemented('getIrrigacoes');
  }

  getResumoSemanal() {
    return this.notImplemented('getResumoSemanal');
  }

  createCanteiro() {
    return this.notImplemented('createCanteiro');
  }

  updateCanteiro() {
    return this.notImplemented('updateCanteiro');
  }

  deleteCanteiro() {
    return this.notImplemented('deleteCanteiro');
  }
}
