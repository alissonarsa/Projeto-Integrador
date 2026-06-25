export type IrrigacaoEstado = 'on' | 'off' | 'falha_rele';

export type AlertaTipo =
  | 'umidade-critica'
  | 'sensor-offline'
  | 'leitura-suspeita'
  | 'irrigacao-manual';

export interface Canteiro {
  id: string;
  nome: string;
  localizacao: string;
  cultura: string;
  ativo: boolean;
}

export interface Leitura {
  id: string;
  canteiroId: string;
  temperatura: number | null;
  umidadeAr: number | null;
  umidadeSolo: number | null;
  luminosidade: number | null;
  timestamp: string;
  irrigacao: IrrigacaoEstado;
  parcial?: boolean;
  sensorOffline?: boolean;
  suspeita?: boolean;
  suspeitaMotivos?: string[];
}

export interface Alerta {
  id: string;
  canteiroId: string;
  canteiroNome: string;
  tipo: AlertaTipo;
  mensagem: string;
  timestamp: string;
  resolvido: boolean;
}

export interface IrrigacaoEvento {
  id: string;
  canteiroId: string;
  timestampInicio: string;
  timestampFim: string;
  duracaoMin: number;
  litrosEstimados: number;
  acionadoPor: 'automatico' | 'manual';
}

export interface ResumoSemanal {
  semana: string;
  litrosTotal: number;
  irrigacoesTotal: number;
}

export interface DashboardSnapshot {
  canteiros: Canteiro[];
  leituras: Leitura[];
}

export interface DashboardClient {
  getCanteiros(): Promise<Canteiro[]>;
  getLeiturasUltimas(): Promise<Leitura[]>;
  getHistoricoLeituras(): Promise<Leitura[]>;
  getAlertas(): Promise<Alerta[]>;
  getIrrigacoes(): Promise<IrrigacaoEvento[]>;
  getResumoSemanal(): Promise<ResumoSemanal[]>;
  createCanteiro(input: Omit<Canteiro, 'id'>): Promise<Canteiro>;
  updateCanteiro(id: string, input: Omit<Canteiro, 'id'>): Promise<Canteiro>;
  deleteCanteiro(id: string): Promise<void>;
}
