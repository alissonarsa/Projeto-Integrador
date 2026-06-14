# Dashboard Completo — A1.8

| Campo | Valor |
|:---|:---|
| Entrega | A1.8 — Dashboard Completo Mockado |
| Código | `dashboard/` |
| Base | A1.7 — Dashboard Geral |
| Dados | Mocks representativos, consistentes com o dataset sintético Jan–Jun/2026 (ver nota abaixo) |

## Telas entregues

- **WF-01 Principal** — status dos canteiros + gráficos + KPI + relatório agregado
- **WF-02 Histórico** — tabela paginada + filtro + exportação CSV (rótulo rescopado de "Detalhe do Canteiro" para "Histórico" — ver RFC-001 §8)
- **WF-03 Alertas** — filtros por canteiro/tipo/período + alerta concreto + ação "Ver no histórico"
- **WF-04 Cadastro de canteiros** — CRUD mockado com validação

## Estados visuais replicados

Cada tela cobre pelo menos os estados:

- carregando
- sucesso
- erro
- vazio

## Dados sintéticos

O dataset sintético do PI (gerador `dados/2026-05-26--gerar-dados-sinteticos.py --seed 42`, 207.360 leituras) define os mesmos 4 canteiros e culturas usados nos mocks. Os mocks em `dashboard/src/data/mocks/fixtures.ts` **não carregam os 207 mil registros**: usam fatias representativas, com faixas de valores coerentes com o dataset, **mais cenários de borda adicionados de propósito** (sensor offline, leitura parcial/suspeita, irrigação manual). Detalhes e instruções de import: `dados/como-usar-dados-sinteticos.md`.

## Plano de migração para API real

O app depende de `DashboardClient`. Hoje a implementação ativa é `MockDashboardClient`; a migração futura troca apenas o provider em `dashboard/src/data/dashboardClient.ts`.
