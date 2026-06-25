import type { Leitura } from '../data/types';
import { recordInvalidReading } from './observability';

type CampoSaneavel = 'temperatura' | 'umidadeAr' | 'umidadeSolo' | 'luminosidade';

interface LimiteCampo {
  min: number;
  max?: number;
  unidade: string;
}

interface CampoInvalidado {
  campo: CampoSaneavel;
  valorOriginal: number | null;
  motivo: string;
}

export interface SanitizeLeituraOptions {
  origem?: string;
  requestId?: string;
  emitirLog?: boolean;
}

export const LIMITES_LEITURA: Record<CampoSaneavel, LimiteCampo> = {
  temperatura: { min: -10, max: 80, unidade: '°C' },
  umidadeAr: { min: 0, max: 100, unidade: '%' },
  umidadeSolo: { min: 0, max: 100, unidade: '%' },
  luminosidade: { min: 0, unidade: 'lux' },
};

const CAMPOS_SANEAVEIS: CampoSaneavel[] = ['temperatura', 'umidadeAr', 'umidadeSolo', 'luminosidade'];

function descreverFaixa(campo: CampoSaneavel): string {
  const limite = LIMITES_LEITURA[campo];
  if (limite.max === undefined) {
    return `>= ${limite.min} ${limite.unidade}`;
  }

  return `${limite.min} a ${limite.max} ${limite.unidade}`;
}

function validarCampo(campo: CampoSaneavel, valor: number | null): CampoInvalidado | null {
  if (valor === null) return null;

  const limite = LIMITES_LEITURA[campo];
  const foraDoMinimo = valor < limite.min;
  const foraDoMaximo = limite.max !== undefined && valor > limite.max;

  if (!Number.isFinite(valor) || foraDoMinimo || foraDoMaximo) {
    return {
      campo,
      valorOriginal: valor,
      motivo: `${campo} fora da faixa plausível (${descreverFaixa(campo)})`,
    };
  }

  return null;
}

function motivosUnicos(motivos: string[]): string[] {
  return [...new Set(motivos)];
}

export function sanitizeLeitura(
  leitura: Leitura,
  options: SanitizeLeituraOptions = {},
): Leitura {
  const saneada: Leitura = { ...leitura };
  const camposInvalidos: CampoInvalidado[] = [];

  for (const campo of CAMPOS_SANEAVEIS) {
    const invalidacao = validarCampo(campo, saneada[campo]);
    if (invalidacao) {
      saneada[campo] = null;
      camposInvalidos.push(invalidacao);
    }
  }

  if (camposInvalidos.length > 0) {
    saneada.suspeita = true;
    saneada.suspeitaMotivos = motivosUnicos([
      ...(leitura.suspeitaMotivos ?? []),
      ...camposInvalidos.map((item) => item.motivo),
    ]);

    if (options.emitirLog !== false) {
      recordInvalidReading(
        {
          origem: options.origem ?? 'dashboard',
          leituraId: leitura.id,
          canteiroId: leitura.canteiroId,
          campos: camposInvalidos.map((item) => ({
            campo: item.campo,
            valorOriginal: item.valorOriginal,
            faixa: descreverFaixa(item.campo),
          })),
        },
        options.origem ?? 'dashboard',
        options.requestId,
      );
    }
  } else if (leitura.suspeitaMotivos && leitura.suspeitaMotivos.length > 0) {
    saneada.suspeitaMotivos = motivosUnicos(leitura.suspeitaMotivos);
  }

  return saneada;
}

export function sanitizeLeituras(
  leituras: Leitura[],
  options: SanitizeLeituraOptions = {},
): Leitura[] {
  return leituras.map((leitura) => sanitizeLeitura(leitura, options));
}

export function valoresValidos(
  leituras: Leitura[],
  campo: CampoSaneavel,
): number[] {
  return leituras
    .map((leitura) => leitura[campo])
    .filter((valor): valor is number => valor !== null && Number.isFinite(valor));
}

export function mediaCampoValido(
  leituras: Leitura[],
  campo: CampoSaneavel,
): number | null {
  const valores = valoresValidos(leituras, campo);
  if (valores.length === 0) return null;

  return valores.reduce((total, valor) => total + valor, 0) / valores.length;
}
