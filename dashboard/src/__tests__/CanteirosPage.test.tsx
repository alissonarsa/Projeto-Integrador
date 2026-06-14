import { fireEvent, render, screen } from '@testing-library/react';
import { CanteirosPage } from '../pages/CanteirosPage';
import { MockDashboardClient } from '../data/mockDashboardClient';

test('valida formulário e cria novo canteiro', async () => {
  render(<CanteirosPage client={new MockDashboardClient({ delayMs: 0 })} />);
  expect(await screen.findByText(/WF-04 — Cadastro de canteiros/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Criar canteiro/i }));
  expect(await screen.findByText(/Nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Canteiro E — Teste' } });
  fireEvent.change(screen.getByLabelText(/Localização/i), { target: { value: 'Estufa 3' } });
  fireEvent.change(screen.getByLabelText(/Cultura/i), { target: { value: 'Almeirão' } });
  fireEvent.click(screen.getByRole('button', { name: /Criar canteiro/i }));

  expect(await screen.findByText(/Canteiro E — Teste/i)).toBeInTheDocument();
});
