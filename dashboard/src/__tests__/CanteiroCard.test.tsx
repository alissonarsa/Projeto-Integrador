import { render, screen } from '@testing-library/react';
import { CanteiroCard } from '../components/CanteiroCard';
import type { Canteiro, Leitura } from '../data/types';

const canteiro: Canteiro = {
  id: 'c1',
  nome: 'Canteiro Teste',
  localizacao: 'Estufa 1',
  cultura: 'Alface',
  ativo: true
};

test('exibe fallback e alerta quando umidade do solo é nula, sem quebrar', () => {
  const leitura: Leitura = {
  id: 'l1',
  canteiroId: 'c1',
  temperatura: 24,
  umidadeAr: 65,
  umidadeSolo: null,
  luminosidade: 320,
  timestamp: '2026-06-14T10:00:00Z',
  irrigacao: 'off'
};
  render(<CanteiroCard canteiro={canteiro} leitura={leitura} />);
  expect(screen.getByText('Canteiro Teste')).toBeInTheDocument();
  expect(screen.getByTitle('Sensor com falha — verificar conexão')).toBeInTheDocument();
});

test('marca dados desatualizados quando a última leitura passou de 15 min', () => {
  const agora = new Date('2026-06-14T10:16:00Z').getTime();
  const leitura: Leitura = {
  id: 'l2',
  canteiroId: 'c1',
  temperatura: 22,
  umidadeAr: 70,
  umidadeSolo: 41,
  luminosidade: 280,
  timestamp: '2026-06-14T10:00:00Z',
  irrigacao: 'off'
};
  render(<CanteiroCard canteiro={canteiro} leitura={leitura} now={agora} />);
  expect(screen.getByText(/Sem dados recentes/)).toBeInTheDocument();
});
