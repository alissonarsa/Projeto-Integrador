# Como usar os dados sintéticos

Este documento explica como **gerar**, **importar** e **relacionar** o dataset
sintético da Horta Inteligente com o dashboard. Os dados simulam 6 meses de
operação (Jan–Jun/2026) com padrões realistas (ciclo dia/noite, sazonalidade,
curva solar, decaimento de umidade do solo e irrigação automática).

## 1. Gerar

O script não tem dependências externas (só stdlib do Python 3).

```bash
cd dados
python3 2026-05-26--gerar-dados-sinteticos.py --seed 42
```

Isso cria `dados/dados-sinteticos/` com:

| Arquivo | Registros | Conteúdo |
|---|---|---|
| `usuarios.csv` | 3 | admin, operador, visualizador |
| `canteiros.csv` | 4 | Canteiros A–D |
| `culturas.csv` | 4 | Cultura de cada canteiro |
| `sensores.csv` | 12 | 3 sensores por canteiro (DHT22, Capacitivo, LDR) |
| `leituras.csv` | 207.360 | Leitura a cada 5 min, Jan–Jun/2026 |
| `irrigacoes.csv` | ~574 | Eventos de irrigação automática |
| `seed.sql` | — | INSERTs dos cadastros |

> A pasta `dados-sinteticos/` está no `.gitignore`: são ~11 MB de saída
> **regenerável** (seed fixo `42`), então não a versionamos. A evidência da
> última geração está em `dados/evidencias/geracao-dados-sinteticos.txt`.

## 2. Esquema dos CSVs

```
usuarios(id, nome, email, papel)
canteiros(id, nome, cultura)
culturas(id, nome, canteiro_id)
sensores(id, canteiro_id, tipo, mede, modelo, instalado_em, ativo)
leituras(id, sensor_id, canteiro_id, timestamp, temperatura_ar, umidade_ar, umidade_solo, luminosidade)
irrigacoes(id, canteiro_id, timestamp_inicio, timestamp_fim, duracao_min, umidade_solo_antes, umidade_solo_depois, acionado_por)
```

Regra de irrigação embutida nos dados: dispara quando `umidade_solo < 40%` **e**
`luminosidade < 500 lux`.

## 3. Importar

### PostgreSQL (alvo da RFC-001)

```sql
-- crie as tabelas conforme o esquema acima, depois:
\copy canteiros  FROM 'dados-sinteticos/canteiros.csv'  WITH (FORMAT csv, HEADER true);
\copy culturas   FROM 'dados-sinteticos/culturas.csv'   WITH (FORMAT csv, HEADER true);
\copy sensores   FROM 'dados-sinteticos/sensores.csv'   WITH (FORMAT csv, HEADER true);
\copy leituras   FROM 'dados-sinteticos/leituras.csv'   WITH (FORMAT csv, HEADER true);
\copy irrigacoes FROM 'dados-sinteticos/irrigacoes.csv' WITH (FORMAT csv, HEADER true);
```

### MySQL

```sql
LOAD DATA LOCAL INFILE 'dados-sinteticos/leituras.csv'
INTO TABLE leituras
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n' IGNORE 1 LINES;
```

(Repita para cada CSV. Os cadastros pequenos também podem ser carregados via
`seed.sql`.)

### Firebase / Firestore

Os CSVs não têm join nativo no Firestore. Sugestão: um pequeno script lê cada
CSV e grava uma coleção (`canteiros`, `sensores`, `leituras`, …), usando o `id`
do CSV como id do documento e mantendo `canteiro_id` como campo para consulta.

## 4. Relação com o dashboard (A1.8)

O dashboard da A1.8 é **deliberadamente mockado** (a integração com a API/banco
reais é responsabilidade do Marco 4 do PI). Os mocks em
`dashboard/src/data/mocks/fixtures.ts` **não carregam os 207 mil registros**;
eles usam **fatias representativas e consistentes** com este dataset:

- os mesmos 4 canteiros e culturas (ex.: "Canteiro A — Hortaliças folhosas");
- faixas de valores coerentes com os padrões gerados (temperatura, umidade,
  luminosidade, estado de irrigação);
- **cenários de borda adicionados de propósito** (sensor offline, leitura
  parcial, leitura suspeita, irrigação manual) que o gerador "feliz" não produz.

Quando a API real existir, o `HttpDashboardClient` (já presente como fronteira)
passa a servir estes mesmos dados a partir do banco, sem mudar os componentes.
