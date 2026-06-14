import type { Canteiro, Leitura, IrrigacaoEstado } from "../data/types";
import { LIMITE_DADOS_RECENTES_MIN, minutosDesde } from "../utils/tempo";

interface Props {
  canteiro: Canteiro;
  leitura?: Leitura;
  now?: number;
}

const ROTULO_IRRIGACAO: Record<IrrigacaoEstado, string> = {
  on: "Irrigando",
  off: "Desligada",
  falha_rele: "Falha no relé",
};

function Campo({
  rotulo,
  valor,
  unidade,
}: {
  rotulo: string;
  valor: number | null;
  unidade: string;
}) {
  const semDado = valor === null;
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm">
      <span className="font-medium text-slate-600">{rotulo}</span>
      <div className="mt-1 text-slate-900">
        {semDado ? (
          <span title="Sensor com falha — verificar conexão">— ⚠</span>
        ) : (
          <span>
            {valor} {unidade}
          </span>
        )}
      </div>
    </div>
  );
}

export function CanteiroCard({ canteiro, leitura, now = Date.now() }: Props) {
  const minutos = leitura ? minutosDesde(leitura.timestamp, now) : null;
  const desatualizado = minutos !== null && minutos > LIMITE_DADOS_RECENTES_MIN;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {canteiro.nome}
          </h2>
          <p className="text-sm text-slate-500">
            {canteiro.cultura} · {canteiro.localizacao}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {ROTULO_IRRIGACAO[leitura?.irrigacao ?? "off"]}
        </span>
      </div>

      {leitura ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Campo
            rotulo="Temperatura"
            valor={leitura.temperatura}
            unidade="°C"
          />
          <Campo rotulo="Umidade do ar" valor={leitura.umidadeAr} unidade="%" />
          <Campo
            rotulo="Umidade do solo"
            valor={leitura.umidadeSolo}
            unidade="%"
          />
          <Campo
            rotulo="Luminosidade"
            valor={leitura.luminosidade}
            unidade="lux"
          />
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Sem leitura disponível.
        </p>
      )}

      {desatualizado ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Sem dados recentes — última leitura há {minutos} min
        </p>
      ) : null}
    </article>
  );
}
