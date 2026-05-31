// Contrato-alvo do UC-03/RFC (canteiro_id, temperatura, umidade_ar, umidade_solo,
// luminosidade, timestamp). NÃO confundir com o stub simplificado da API de
// referência da aula (device_id/sensor/valor) usado nos testes de contrato A1.6.

export type IrrigacaoEstado = 'on' | 'off' | 'falha_rele';

export interface Canteiro {
  id: string;
  nome: string;
  localizacao?: string;
  cultura?: string;
}

export interface Leitura {
  canteiroId: string;
  temperatura: number | null; // °C
  umidadeAr: number | null; // %
  umidadeSolo: number | null; // %
  luminosidade: number | null; // lux
  timestamp: string; // ISO 8601
  irrigacao: IrrigacaoEstado;
}

export interface DashboardSnapshot {
  canteiros: Canteiro[];
  leituras: Leitura[]; // última leitura por canteiro
}

// Camada de fetch isolada: o resto do app depende SÓ desta interface.
export interface DashboardClient {
  getCanteiros(): Promise<Canteiro[]>;
  getLeiturasUltimas(): Promise<Leitura[]>;
}
