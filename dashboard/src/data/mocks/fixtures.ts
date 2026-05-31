import type { Canteiro, Leitura } from '../types';

// Timestamps relativos ao carregamento do módulo, para manter a demo coerente.
const agora = Date.now();
const minAtras = (m: number): string => new Date(agora - m * 60_000).toISOString();

export const CANTEIROS_MOCK: Canteiro[] = [
  { id: 'cant-a', nome: 'Canteiro A — Alface', localizacao: 'Estufa 1', cultura: 'Alface crespa' },
  { id: 'cant-b', nome: 'Canteiro B — Tomate', localizacao: 'Estufa 1', cultura: 'Tomate cereja' },
  { id: 'cant-c', nome: 'Canteiro C — Manjericão', localizacao: 'Estufa 2', cultura: 'Manjericão' },
  { id: 'cant-d', nome: 'Canteiro D — Cenoura', localizacao: 'Externo', cultura: 'Cenoura' },
];

export const LEITURAS_MOCK: Leitura[] = [
  // A: caminho feliz, irrigando (solo baixo + pouca luz)
  { canteiroId: 'cant-a', temperatura: 24.5, umidadeAr: 62, umidadeSolo: 38, luminosidade: 320, timestamp: minAtras(2), irrigacao: 'on' },
  // B: caminho feliz, irrigação desligada
  { canteiroId: 'cant-b', temperatura: 25.1, umidadeAr: 58, umidadeSolo: 52, luminosidade: 610, timestamp: minAtras(3), irrigacao: 'off' },
  // C: sensor de solo falho (umidadeSolo null) — estado E4
  { canteiroId: 'cant-c', temperatura: 23.8, umidadeAr: 67, umidadeSolo: null, luminosidade: 280, timestamp: minAtras(3), irrigacao: 'off' },
  // D: dados desatualizados (>15 min) — estado E3
  { canteiroId: 'cant-d', temperatura: 22.4, umidadeAr: 71, umidadeSolo: 45, luminosidade: 150, timestamp: minAtras(22), irrigacao: 'falha_rele' },
];
