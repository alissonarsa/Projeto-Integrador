import { useEffect, useMemo, useState } from 'react';
import type { Canteiro, DashboardClient } from '../data/types';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { usePageRenderMetric } from '../hooks/usePageRenderMetric';

interface Props {
  client: DashboardClient;
}

const EMPTY_FORM: Omit<Canteiro, 'id'> = { nome: '', localizacao: '', cultura: '', ativo: true };

export function CanteirosPage({ client }: Props) {
  usePageRenderMetric('canteiros');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [canteiros, setCanteiros] = useState<Canteiro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Canteiro, 'id'>>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);

  async function carregar() {
    setStatus('loading');
    setError(null);
    try {
      const dados = await client.getCanteiros();
      setCanteiros(dados);
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar canteiros');
      setStatus('error');
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const tituloFormulario = useMemo(() => (editingId ? 'Editar canteiro' : 'Novo canteiro'), [editingId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.nome.trim().length < 3) {
      setValidation('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!form.localizacao.trim() || !form.cultura.trim()) {
      setValidation('Localização e cultura são obrigatórias.');
      return;
    }

    setValidation(null);
    if (editingId) {
      const updated = await client.updateCanteiro(editingId, form);
      setCanteiros((current) => current.map((item) => (item.id === editingId ? updated : item)));
    } else {
      const created = await client.createCanteiro(form);
      setCanteiros((current) => [created, ...current]);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function remove(id: string) {
    await client.deleteCanteiro(id);
    setCanteiros((current) => current.filter((item) => item.id !== id));
  }

  if (status === 'loading') return <LoadingState label="Carregando cadastro de canteiros…" />;
  if (status === 'error') {
    return <ErrorState title="Falha ao carregar cadastro" description={error ?? 'Erro inesperado'} action={<button type="button" onClick={() => void carregar()} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Tentar novamente</button>} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">WF-04 — Cadastro de canteiros</h2>
          <p className="mt-1 text-sm text-slate-500">CRUD mockado com validação, edição e remoção.</p>
        </div>
        {canteiros.length === 0 ? (
          <EmptyState title="Nenhum canteiro cadastrado" description="Use o formulário ao lado para criar o primeiro canteiro." />
        ) : (
          <div className="space-y-3">
            {canteiros.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.nome}</h3>
                    <p className="text-sm text-slate-500">{item.cultura} · {item.localizacao}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEditingId(item.id); setForm({ nome: item.nome, localizacao: item.localizacao, cultura: item.cultura, ativo: item.ativo }); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Editar</button>
                    <button type="button" onClick={() => void remove(item.id)} className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white">Excluir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{tituloFormulario}</h2>
        <form className="mt-4 space-y-4" onSubmit={(event) => void submit(event)}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Nome</span>
            <input value={form.nome} onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Localização</span>
            <input value={form.localizacao} onChange={(e) => setForm((current) => ({ ...current, localizacao: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Cultura</span>
            <input value={form.cultura} onChange={(e) => setForm((current) => ({ ...current, cultura: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((current) => ({ ...current, ativo: e.target.checked }))} />
            Canteiro ativo
          </label>
          {validation ? <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{validation}</p> : null}
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Salvar alterações' : 'Criar canteiro'}</button>
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setValidation(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Limpar</button>
          </div>
        </form>
      </section>
    </div>
  );
}
