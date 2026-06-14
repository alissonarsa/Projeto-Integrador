interface Props {
  ultimaAtualizacao: Date | null;
}

export function ConnectionBanner({ ultimaAtualizacao }: Props) {
  const hora = ultimaAtualizacao
    ? ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Última atualização: {hora} — Sem conexão
    </div>
  );
}
