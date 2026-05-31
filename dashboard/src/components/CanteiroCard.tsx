import type { Canteiro, IrrigacaoEstado, Leitura } from '../data/types';
import { LIMITE_DADOS_RECENTES_MIN, minutosDesde } from '../utils/tempo';

interface Props {
  canteiro: Canteiro;
  leitura?: Leitura;
  now?: number;
}

const ROTULO_IRRIGACAO: Record<IrrigacaoEstado, string> = {
  on: 'Irrigando',
  off: 'Desligada',
  falha_rele: 'Falha no relé',
};

function Campo({ rotulo, valor, unidade }: { rotulo: string; valor: number | null; unidade: string }) {
  const semDado = valor === null;
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{rotulo}</span>
      {semDado ? (
        <span className="font-medium text-amber-600" title="Sensor com falha — verificar conexão">
          — ⚠
        </span>
      ) : (
        <span className="font-medium">
          {valor}
          {unidade}
        </span>
      )}
    </div>
  );
}

export function CanteiroCard({ canteiro, leitura, now = Date.now() }: Props) {
  const minutos = leitura ? minutosDesde(leitura.timestamp, now) : null;
  const desatualizado = minutos !== null && minutos > LIMITE_DADOS_RECENTES_MIN;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-semibold">{canteiro.nome}</h2>
        <span className="shrink-0 text-xs text-gray-400">
          {ROTULO_IRRIGACAO[leitura?.irrigacao ?? 'off']}
        </span>
      </header>

      {leitura ? (
        <div className="space-y-1 text-sm">
          <Campo rotulo="Temperatura" valor={leitura.temperatura} unidade="°C" />
          <Campo rotulo="Umidade do ar" valor={leitura.umidadeAr} unidade="%" />
          <Campo rotulo="Umidade do solo" valor={leitura.umidadeSolo} unidade="%" />
          <Campo rotulo="Luminosidade" valor={leitura.luminosidade} unidade=" lux" />
        </div>
      ) : (
        <p className="text-sm text-gray-400">Sem leitura disponível.</p>
      )}

      {desatualizado && (
        <p className="mt-3 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
          Sem dados recentes — última leitura há {minutos} min
        </p>
      )}
    </article>
  );
}
