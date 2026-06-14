import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('navega entre as 4 telas do dashboard completo', async () => {
  render(<App />);
  expect(await screen.findByText(/WF-01 — Dashboard Geral/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Alertas' }));
  expect(await screen.findByText(/WF-03 — Alertas/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
  expect(await screen.findByText(/WF-02 — Histórico de leituras/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cadastro de canteiros' }));
  expect(await screen.findByText(/WF-04 — Cadastro de canteiros/i)).toBeInTheDocument();
});
