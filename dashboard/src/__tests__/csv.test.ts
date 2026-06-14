import { escapeCsvValue, toCsv } from '../utils/csv';

// Ancora a mitigação declarada no threat model (CSV/formula injection).
test('neutraliza CSV/formula injection em valores que começam com = + - @', () => {
  expect(escapeCsvValue('=SOMA(A1:A2)')).toBe("'=SOMA(A1:A2)");
  expect(escapeCsvValue('+1')).toBe("'+1");
  expect(escapeCsvValue('-cmd')).toBe("'-cmd");
  expect(escapeCsvValue('@import')).toBe("'@import");
});

test('escapa aspas e delimitadores e preserva valores normais', () => {
  expect(escapeCsvValue('Canteiro A')).toBe('Canteiro A');
  expect(escapeCsvValue('a;b')).toBe('"a;b"');
  expect(escapeCsvValue('diz "oi"')).toBe('"diz ""oi"""');
});

test('toCsv monta cabeçalho e linhas separados por ;', () => {
  const csv = toCsv([
    { nome: 'A', valor: 1 },
    { nome: 'B', valor: 2 }
  ]);
  expect(csv.split('\n')[0]).toBe('nome;valor');
  expect(csv).toContain('A;1');
});
