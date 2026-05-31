interface Props {
  ultimaAtualizacao: Date | null;
}

export function ConnectionBanner({ ultimaAtualizacao }: Props) {
  const hora = ultimaAtualizacao
    ? ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '—';
  return (
    <div role="alert" className="bg-amber-100 px-4 py-2 text-sm text-amber-800">
      Última atualização: {hora} — Sem conexão
    </div>
  );
}
