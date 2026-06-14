# Dashboard Completo — A1.8

| Campo | Valor |
|:---|:---|
| Entrega | A1.8 — Dashboard Completo Mockado |
| Código | `dashboard/` |
| Base | A1.7 — Dashboard Geral |
| Dados | Mockados a partir do dataset sintético Jan–Jun/2026 |

## Telas entregues

- **WF-01 Principal** — status dos canteiros + gráficos + KPI + relatório agregado
- **WF-02 Histórico** — tabela paginada + filtro + exportação CSV
- **WF-03 Alertas** — filtros por canteiro/tipo/período + alerta concreto
- **WF-04 Cadastro de canteiros** — CRUD mockado com validação

## Estados visuais replicados

Cada tela cobre pelo menos os estados:

- carregando
- sucesso
- erro
- vazio

## Plano de migração para API real

O app depende de `DashboardClient`. Hoje a implementação ativa é `MockDashboardClient`; a migração futura troca apenas o provider em `dashboard/src/data/dashboardClient.ts`.
