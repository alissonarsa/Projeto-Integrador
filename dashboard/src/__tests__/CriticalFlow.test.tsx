import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

// Fluxo crítico E2E (UC-03 / matriz A1.6 — linha acceptance do dashboard):
// usuário entra na principal, navega para Alertas, vê um alerta concreto e
// clica para investigá-lo no Histórico. Cobre a navegação acionada por um
// dado real (alerta de umidade crítica), não só o clique nos botões de menu.
test('fluxo crítico: principal → alertas → vê alerta → vai para o histórico', async () => {
  render(<App />);

  // 1. Entra na principal (WF-01).
  expect(await screen.findByText(/WF-01 — Dashboard Geral/i)).toBeInTheDocument();

  // 2. Navega para Alertas e vê o alerta concreto de umidade crítica.
  fireEvent.click(screen.getByRole('button', { name: /^Alertas$/i }));
  expect(await screen.findByText(/WF-03 — Alertas/i)).toBeInTheDocument();
  expect(await screen.findByText(/umidade-critica/i)).toBeInTheDocument();

  // 3. Clica em "Ver no histórico" a partir do alerta e cai na tela de histórico (WF-02).
  const investigar = await screen.findAllByRole('button', { name: /Ver no histórico/i });
  fireEvent.click(investigar[0]);
  expect(await screen.findByText(/WF-02 — Histórico de leituras/i)).toBeInTheDocument();
});
