import { render, screen } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';
import { MockDashboardClient } from '../data/mockDashboardClient';
import type { DashboardClient } from '../data/types';

// Client estável (definido fora do render) que devolve nenhum canteiro.
const emptyClient: DashboardClient = {
  getCanteiros: async () => [],
  getLeiturasUltimas: async () => [],
};

test('renderiza um card por canteiro no caminho feliz', async () => {
  const client = new MockDashboardClient({ delayMs: 0 });
  render(<Dashboard client={client} pollMs={1_000_000} />);
  expect(await screen.findByText(/Canteiro A/)).toBeInTheDocument();
  expect(await screen.findByText(/Canteiro B/)).toBeInTheDocument();
});

test('mostra erro e botão "Tentar novamente" quando a carga inicial falha', async () => {
  const client = new MockDashboardClient({ delayMs: 0, fail: true });
  render(<Dashboard client={client} pollMs={1_000_000} />);
  expect(await screen.findByRole('button', { name: /Tentar novamente/ })).toBeInTheDocument();
});

test('mostra mensagem de vazio quando não há canteiros (E5)', async () => {
  render(<Dashboard client={emptyClient} pollMs={1_000_000} />);
  expect(await screen.findByText(/Nenhum canteiro cadastrado/)).toBeInTheDocument();
});
