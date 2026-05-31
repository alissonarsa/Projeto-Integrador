import type { Canteiro, DashboardClient, Leitura } from './types';
import { CANTEIROS_MOCK, LEITURAS_MOCK } from './mocks/fixtures';

export interface MockOptions {
  delayMs?: number; // simula latência de rede
  fail?: boolean; // simula API offline / fetch falho
}

export class MockDashboardClient implements DashboardClient {
  private readonly delayMs: number;
  private readonly fail: boolean;

  constructor(options: MockOptions = {}) {
    this.delayMs = options.delayMs ?? 400;
    this.fail = options.fail ?? false;
  }

  private wait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  async getCanteiros(): Promise<Canteiro[]> {
    await this.wait();
    if (this.fail) throw new Error('Falha simulada ao buscar canteiros');
    return CANTEIROS_MOCK;
  }

  async getLeiturasUltimas(): Promise<Leitura[]> {
    await this.wait();
    if (this.fail) throw new Error('Falha simulada ao buscar leituras');
    return LEITURAS_MOCK;
  }
}
