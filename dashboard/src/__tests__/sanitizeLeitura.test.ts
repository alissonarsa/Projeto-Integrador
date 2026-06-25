import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Leitura } from '../data/types';
import { MockDashboardClient } from '../data/mockDashboardClient';
import { Dashboard } from '../pages/Dashboard';
import {
  mediaCampoValido,
  sanitizeLeituras,
  valoresValidos,
} from '../utils/sanitizeLeitura';
import {
  getObservabilitySnapshot,
  resetObservability,
} from '../utils/observability';

const timestamp = '2026-06-12T19:30:00.000Z';

const leituraImpossivel: Leitura = {
  id: 'leitura-impossivel',
  canteiroId: 'cant-a',
  temperatura: -999,
  umidadeAr: 4000,
  umidadeSolo: 4000,
  luminosidade: -5,
  timestamp,
  irrigacao: 'off',
};

const leituraBordaLegitima: Leitura = {
  id: 'leitura-borda-legitima',
  canteiroId: 'cant-d',
  temperatura: 52.4,
  umidadeAr: 28,
  umidadeSolo: 28,
  luminosidade: 0,
  timestamp,
  irrigacao: 'off',
};

const loteComBordaEImpossivel: Leitura[] = [
  leituraImpossivel,
  leituraBordaLegitima,
];

describe('sanitizeLeitura', () => {
  beforeEach(() => {
    resetObservability();
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('exclui leitura impossível dos agregados e preserva borda legítima de 52,4 °C', () => {
    const saneadas = sanitizeLeituras(loteComBordaEImpossivel, {
      origem: 'sanitizeLeitura.test',
    });

    const impossivel = saneadas.find((item) => item.id === 'leitura-impossivel');
    const borda = saneadas.find((item) => item.id === 'leitura-borda-legitima');

    expect(impossivel).toMatchObject({
      temperatura: null,
      umidadeAr: null,
      umidadeSolo: null,
      luminosidade: null,
      suspeita: true,
    });
    expect(impossivel?.suspeitaMotivos).toEqual(
      expect.arrayContaining([
        expect.stringContaining('temperatura fora da faixa plausível'),
        expect.stringContaining('umidadeSolo fora da faixa plausível'),
      ]),
    );

    expect(borda).toMatchObject({
      temperatura: 52.4,
      umidadeAr: 28,
      umidadeSolo: 28,
      luminosidade: 0,
    });
    expect(borda?.suspeita).toBeFalsy();

    expect(valoresValidos(saneadas, 'temperatura')).toEqual([52.4]);
    expect(mediaCampoValido(saneadas, 'umidadeSolo')).toBe(28);
  });

  test('registra leitura inválida em observabilidade sem transformar defeito em silêncio', () => {
    sanitizeLeituras(loteComBordaEImpossivel, { origem: 'dashboard' });

    const snapshot = getObservabilitySnapshot();
    const invalidLog = snapshot.logs.find((log) => log.event === 'sensor.reading.invalid');

    expect(snapshot.metrics.invalidReadings).toBe(1);
    expect(invalidLog).toBeDefined();
    expect(invalidLog?.level).toBe('warn');
    expect(invalidLog?.meta).toMatchObject({
      origem: 'dashboard',
      leituraId: 'leitura-impossivel',
      canteiroId: 'cant-a',
    });
    expect(invalidLog?.meta?.campos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campo: 'temperatura', valorOriginal: -999 }),
        expect.objectContaining({ campo: 'umidadeSolo', valorOriginal: 4000 }),
      ]),
    );
  });

  test('MockDashboardClient saneia a fronteira antes de entregar dados para a tela', async () => {
    const client = new MockDashboardClient({
      delayMs: 0,
      leituras: loteComBordaEImpossivel,
      historico: loteComBordaEImpossivel,
    });

    const ultimas = await client.getLeiturasUltimas();
    const historico = await client.getHistoricoLeituras();

    expect(ultimas.find((item) => item.id === 'leitura-impossivel')?.temperatura).toBeNull();
    expect(ultimas.find((item) => item.id === 'leitura-impossivel')?.umidadeSolo).toBeNull();
    expect(historico.find((item) => item.id === 'leitura-impossivel')?.umidadeSolo).toBeNull();

    expect(ultimas.find((item) => item.id === 'leitura-borda-legitima')?.temperatura).toBe(52.4);
    expect(valoresValidos(ultimas, 'umidadeSolo')).toEqual([28]);
  });

  test('Dashboard mostra saúde da coleta e não renderiza valores impossíveis nos KPIs/cards/sparkline', async () => {
    const client = new MockDashboardClient({
      delayMs: 0,
      leituras: loteComBordaEImpossivel,
      historico: loteComBordaEImpossivel,
    });

    render(React.createElement(Dashboard, { client, pollMs: 999999 }));

    expect(await screen.findByText(/Saúde da coleta/i)).toBeInTheDocument();
    expect(screen.getByText(/Leituras suspeitas/i)).toBeInTheDocument();
    expect(screen.getByText(/temperatura fora da faixa plausível/i)).toBeInTheDocument();
    expect(screen.getAllByText(/52\.4/).length).toBeGreaterThan(0);

    expect(screen.queryByText(/-999/)).not.toBeInTheDocument();
    expect(screen.queryByText(/4000/)).not.toBeInTheDocument();
  });
});
