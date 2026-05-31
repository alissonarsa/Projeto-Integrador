import { render, screen } from '@testing-library/react';
import { CanteiroCard } from '../components/CanteiroCard';
import type { Canteiro, Leitura } from '../data/types';

const canteiro: Canteiro = { id: 'c1', nome: 'Canteiro Teste' };

test('exibe fallback e alerta quando umidade do solo é nula, sem quebrar', () => {
  const leitura: Leitura = {
    canteiroId: 'c1',
    temperatura: 24,
    umidadeAr: 60,
    umidadeSolo: null,
    luminosidade: 300,
    timestamp: new Date().toISOString(),
    irrigacao: 'off',
  };
  render(<CanteiroCard canteiro={canteiro} leitura={leitura} />);
  expect(screen.getByText('Canteiro Teste')).toBeInTheDocument();
  expect(screen.getByTitle('Sensor com falha — verificar conexão')).toBeInTheDocument();
});

test('marca dados desatualizados quando a última leitura passou de 15 min', () => {
  const agora = new Date('2026-05-31T12:00:00Z').getTime();
  const leitura: Leitura = {
    canteiroId: 'c1',
    temperatura: 24,
    umidadeAr: 60,
    umidadeSolo: 40,
    luminosidade: 300,
    timestamp: new Date('2026-05-31T11:40:00Z').toISOString(),
    irrigacao: 'off',
  };
  render(<CanteiroCard canteiro={canteiro} leitura={leitura} now={agora} />);
  expect(screen.getByText(/Sem dados recentes/)).toBeInTheDocument();
});
