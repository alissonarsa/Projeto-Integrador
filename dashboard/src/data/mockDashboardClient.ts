import {
  ALERTAS_MOCK,
  CANTEIROS_MOCK,
  HISTORICO_MOCK,
  IRRIGACOES_MOCK,
  LEITURAS_MOCK,
  RESUMO_SEMANAL_MOCK
} from './mocks/fixtures';
import type {
  Alerta,
  Canteiro,
  DashboardClient,
  IrrigacaoEvento,
  Leitura,
  ResumoSemanal
} from './types';
import { logError, logInfo, newRequestId } from '../utils/observability';

type DashboardSection = 'dashboard' | 'alertas' | 'historico' | 'canteiros';

export interface MockOptions {
  delayMs?: number;
  fail?: boolean;
  failSections?: DashboardSection[];
  emptySections?: Array<'alertas' | 'historico' | 'canteiros'>;
}

export class MockDashboardClient implements DashboardClient {
  private readonly delayMs: number;
  private readonly failSections: Set<DashboardSection>;
  private readonly emptySections: Set<string>;
  private canteiros: Canteiro[];
  private historico: Leitura[];
  private alertas: Alerta[];
  private irrigacoes: IrrigacaoEvento[];
  private resumoSemanal: ResumoSemanal[];

  constructor(options: MockOptions = {}) {
    this.delayMs = options.delayMs ?? 180;

    const allSections: DashboardSection[] = ['dashboard', 'alertas', 'historico', 'canteiros'];
    const failByBoolean = options.fail ? allSections : [];

    this.failSections = new Set<DashboardSection>([
      ...failByBoolean,
      ...(options.failSections ?? [])
    ]);

    this.emptySections = new Set(options.emptySections ?? []);
    this.canteiros = structuredClone(CANTEIROS_MOCK);
    this.historico = structuredClone(HISTORICO_MOCK);
    this.alertas = structuredClone(ALERTAS_MOCK);
    this.irrigacoes = structuredClone(IRRIGACOES_MOCK);
    this.resumoSemanal = structuredClone(RESUMO_SEMANAL_MOCK);
  }

  private async simulate<T>(section: DashboardSection, payload: T): Promise<T> {
    const requestId = newRequestId(section);

    logInfo('fetch.start', { section }, undefined, requestId);

    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    if (this.failSections.has(section)) {
      logError('fetch.error', { section, reason: 'Falha simulada' }, undefined, requestId);
      throw new Error(`Falha simulada na seção ${section}`);
    }

    logInfo(
      'fetch.success',
      { section, size: Array.isArray(payload) ? payload.length : 1 },
      undefined,
      requestId
    );

    return structuredClone(payload);
  }

  async getCanteiros(): Promise<Canteiro[]> {
    const payload = this.emptySections.has('canteiros') ? [] : this.canteiros;
    return this.simulate('canteiros', payload);
  }

  async getLeiturasUltimas(): Promise<Leitura[]> {
    const payload = this.emptySections.has('canteiros')
      ? []
      : LEITURAS_MOCK.filter((item) =>
          this.canteiros.some((canteiro) => canteiro.id === item.canteiroId)
        );

    return this.simulate('dashboard', payload);
  }

  async getHistoricoLeituras(): Promise<Leitura[]> {
    const payload = this.emptySections.has('historico')
      ? []
      : this.historico.filter((item) =>
          this.canteiros.some((canteiro) => canteiro.id === item.canteiroId)
        );

    return this.simulate('historico', payload);
  }

  async getAlertas(): Promise<Alerta[]> {
    const payload = this.emptySections.has('alertas')
      ? []
      : this.alertas.filter((item) =>
          this.canteiros.some((canteiro) => canteiro.id === item.canteiroId)
        );

    return this.simulate('alertas', payload);
  }

  async getIrrigacoes(): Promise<IrrigacaoEvento[]> {
    const payload = this.irrigacoes.filter((item) =>
      this.canteiros.some((canteiro) => canteiro.id === item.canteiroId)
    );

    return this.simulate('historico', payload);
  }

  async getResumoSemanal(): Promise<ResumoSemanal[]> {
    return this.simulate('dashboard', this.resumoSemanal);
  }

  async createCanteiro(input: Omit<Canteiro, 'id'>): Promise<Canteiro> {
    const created: Canteiro = {
      id: `cant-${Math.random().toString(36).slice(2, 8)}`,
      ...input
    };

    this.canteiros = [created, ...this.canteiros];
    logInfo('canteiro.created', { id: created.id, nome: created.nome }, 'canteiros');

    return this.simulate('canteiros', created);
  }

  async updateCanteiro(id: string, input: Omit<Canteiro, 'id'>): Promise<Canteiro> {
    const current = this.canteiros.find((item) => item.id === id);

    if (!current) {
      throw new Error('Canteiro não encontrado');
    }

    const updated = { ...current, ...input };
    this.canteiros = this.canteiros.map((item) => (item.id === id ? updated : item));

    logInfo('canteiro.updated', { id: updated.id, nome: updated.nome }, 'canteiros');

    return this.simulate('canteiros', updated);
  }

  async deleteCanteiro(id: string): Promise<void> {
    this.canteiros = this.canteiros.filter((item) => item.id !== id);
    this.alertas = this.alertas.filter((item) => item.canteiroId !== id);
    this.historico = this.historico.filter((item) => item.canteiroId !== id);
    this.irrigacoes = this.irrigacoes.filter((item) => item.canteiroId !== id);

    logInfo('canteiro.deleted', { id }, 'canteiros');

    await this.simulate('canteiros', null);
  }
}