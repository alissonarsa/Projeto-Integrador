import { render, screen } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';
import { MockDashboardClient } from '../data/mockDashboardClient';

test('renderiza cards dos 4 canteiros e relatório agregado na página principal', async () => {
  render(<Dashboard client={new MockDashboardClient({ delayMs: 0 })} pollMs={999999} />);
  expect(await screen.findByText(/Canteiro A — Hortaliças folhosas/i)).toBeInTheDocument();
  expect(await screen.findByText(/Canteiro D — Raízes/i)).toBeInTheDocument();
  expect(await screen.findByText(/Litros na semana/i)).toBeInTheDocument();
  expect(await screen.findByText(/Irrigações na semana/i)).toBeInTheDocument();
});

test('mostra estado de erro quando a carga inicial da principal falha', async () => {
  render(<Dashboard client={new MockDashboardClient({ delayMs: 0, failSections: ['dashboard'] })} pollMs={999999} />);
  expect(await screen.findByText(/Não foi possível conectar ao servidor/i)).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
});
