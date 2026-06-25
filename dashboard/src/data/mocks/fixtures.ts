import type { Alerta, Canteiro, IrrigacaoEvento, Leitura, ResumoSemanal } from '../types';

const agora = Date.now();
const horasAtras = (h: number) => new Date(agora - h * 60 * 60 * 1000).toISOString();
const minutosAtras = (m: number) => new Date(agora - m * 60 * 1000).toISOString();

export const CANTEIROS_MOCK: Canteiro[] = [
  {
    id: 'cant-a',
    nome: 'Canteiro A — Hortaliças folhosas',
    localizacao: 'Estufa 1',
    cultura: 'Alface e Rúcula',
    ativo: true
  },
  {
    id: 'cant-b',
    nome: 'Canteiro B — Temperos',
    localizacao: 'Estufa 1',
    cultura: 'Manjericão e Cebolinha',
    ativo: true
  },
  {
    id: 'cant-c',
    nome: 'Canteiro C — Leguminosas',
    localizacao: 'Externo',
    cultura: 'Feijão-vagem',
    ativo: true
  },
  {
    id: 'cant-d',
    nome: 'Canteiro D — Raízes',
    localizacao: 'Externo',
    cultura: 'Cenoura e Beterraba',
    ativo: true
  }
];

function gerarSerie(
  canteiroId: string,
  base: { temperatura: number; umidadeAr: number; umidadeSolo: number; luminosidade: number },
  ajustes: Partial<Leitura> = {}
): Leitura[] {
  return Array.from({ length: 12 }).map((_, index) => ({
    id: `${canteiroId}-${index + 1}`,
    canteiroId,
    temperatura: Number((base.temperatura + Math.sin(index / 2) * 1.4).toFixed(1)),
    umidadeAr: Number((base.umidadeAr + Math.cos(index / 3) * 4).toFixed(1)),
    umidadeSolo: Number((base.umidadeSolo - index * 0.8).toFixed(1)),
    luminosidade: Number((base.luminosidade + Math.sin(index / 2) * 90).toFixed(1)),
    timestamp: horasAtras(22 - index * 2),
    irrigacao: 'off',
    ...ajustes
  }));
}

const serieA = gerarSerie('cant-a', {
  temperatura: 23.2,
  umidadeAr: 70,
  umidadeSolo: 38,
  luminosidade: 420
});
serieA[11] = {
  ...serieA[11],
  temperatura: 24.1,
  umidadeAr: 66,
  umidadeSolo: 28,
  luminosidade: 220,
  irrigacao: 'on',
  timestamp: minutosAtras(5)
};

const serieB = gerarSerie('cant-b', {
  temperatura: 24.8,
  umidadeAr: 63,
  umidadeSolo: 52,
  luminosidade: 610
});
serieB[11] = {
  ...serieB[11],
  temperatura: 25.3,
  umidadeAr: 60,
  umidadeSolo: 48,
  luminosidade: 650,
  irrigacao: 'off',
  timestamp: minutosAtras(6)
};

const serieC = gerarSerie('cant-c', {
  temperatura: 22.4,
  umidadeAr: 74,
  umidadeSolo: 45,
  luminosidade: 310
});
serieC[10] = {
  ...serieC[10],
  umidadeSolo: null,
  parcial: true,
  sensorOffline: true,
  timestamp: minutosAtras(18)
};
serieC[11] = {
  ...serieC[11],
  temperatura: null,
  umidadeAr: null,
  umidadeSolo: null,
  luminosidade: null,
  parcial: true,
  sensorOffline: true,
  timestamp: minutosAtras(26),
  irrigacao: 'off'
};

const serieD = gerarSerie('cant-d', {
  temperatura: 21.9,
  umidadeAr: 68,
  umidadeSolo: 44,
  luminosidade: 180
});
serieD[11] = {
  ...serieD[11],
  temperatura: 52.4,
  umidadeAr: 28,
  umidadeSolo: 41,
  luminosidade: 155,
  suspeita: true,
  irrigacao: 'falha_rele',
  timestamp: minutosAtras(22)
};

export const HISTORICO_MOCK: Leitura[] = [...serieA, ...serieB, ...serieC, ...serieD]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const LEITURAS_MOCK: Leitura[] = [serieA[11], serieB[11], serieC[11], serieD[11]];

export const ALERTAS_MOCK: Alerta[] = [
  {
    id: 'alerta-1',
    canteiroId: 'cant-a',
    canteiroNome: 'Canteiro A — Hortaliças folhosas',
    tipo: 'umidade-critica',
    mensagem: 'Umidade do solo em 28% — irrigação automática em andamento.',
    timestamp: minutosAtras(5),
    resolvido: false
  },
  {
    id: 'alerta-2',
    canteiroId: 'cant-c',
    canteiroNome: 'Canteiro C — Leguminosas',
    tipo: 'sensor-offline',
    mensagem: 'Sensor de solo/ambiente sem atualização há 26 min.',
    timestamp: minutosAtras(26),
    resolvido: false
  },
  {
    id: 'alerta-3',
    canteiroId: 'cant-d',
    canteiroNome: 'Canteiro D — Raízes',
    tipo: 'leitura-suspeita',
    mensagem: 'Leitura suspeita: temperatura 52.4°C fora do padrão do período.',
    timestamp: minutosAtras(22),
    resolvido: false
  },
  {
    id: 'alerta-4',
    canteiroId: 'cant-b',
    canteiroNome: 'Canteiro B — Temperos',
    tipo: 'irrigacao-manual',
    mensagem: 'Irrigação manual registrada pelo operador João Santos.',
    timestamp: horasAtras(6),
    resolvido: true
  }
];

export const IRRIGACOES_MOCK: IrrigacaoEvento[] = [
  {
    id: 'irr-1',
    canteiroId: 'cant-a',
    timestampInicio: minutosAtras(8),
    timestampFim: minutosAtras(4),
    duracaoMin: 4,
    litrosEstimados: 2.4,
    acionadoPor: 'automatico'
  },
  {
    id: 'irr-2',
    canteiroId: 'cant-b',
    timestampInicio: horasAtras(6.5),
    timestampFim: horasAtras(6.3),
    duracaoMin: 12,
    litrosEstimados: 5.1,
    acionadoPor: 'manual'
  },
  {
    id: 'irr-3',
    canteiroId: 'cant-d',
    timestampInicio: horasAtras(28),
    timestampFim: horasAtras(27.8),
    duracaoMin: 7,
    litrosEstimados: 3.2,
    acionadoPor: 'automatico'
  }
];

export const RESUMO_SEMANAL_MOCK: ResumoSemanal[] = [
  { semana: '2026-S20', litrosTotal: 18.4, irrigacoesTotal: 7 },
  { semana: '2026-S21', litrosTotal: 21.6, irrigacoesTotal: 8 },
  { semana: '2026-S22', litrosTotal: 19.3, irrigacoesTotal: 7 },
  { semana: '2026-S23', litrosTotal: 24.1, irrigacoesTotal: 9 }
];
