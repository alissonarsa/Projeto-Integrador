# Release 2 — Dashboard Completo Mockado (v0.2.0-dashboard-mock)

| Campo | Valor |
|:---|:---|
| Tag sugerida | `v0.2.0-dashboard-mock` |
| Data | 2026-06-12 |
| Entrega | A1.8 |
| Marco | A1 final do dashboard |

## O que entrou nesta release

- **WF-01 Principal**: gráficos mockados (sparklines), status atual dos canteiros, KPIs e relatório agregado semanal.
- **WF-02 Histórico**: tabela paginada, filtros por canteiro, exportação CSV, destaque de bordas (offline, parcial, suspeita).
- **WF-03 Alertas**: lista de alertas com filtros e lógica concreta baseada em mock (`umidade < 30`, sensor offline, leitura suspeita, irrigação manual).
- **WF-04 Cadastro de canteiros**: CRUD mockado com validação, edição e exclusão.
- **Observabilidade no front**: logs estruturados, métricas mínimas, painel de debug e runbook.
- **Threat model do dashboard**: ameaças concretas + mitigação/evidência + scanning de dependências.

## Rastreabilidade

| Tela / artefato | UC / requisito | Evidência |
|---|---|---|
| Principal (WF-01) | UC-03 — Visualizar status dos canteiros | `dashboard/src/__tests__/Dashboard.test.tsx` |
| Alertas (WF-03) | NFR de observabilidade + alerta por condição mockada | `dashboard/src/__tests__/AlertsPage.test.tsx` |
| Histórico (WF-02) | UC-03 / histórico e auditoria visual | `dashboard/src/__tests__/HistoryPage.test.tsx` |
| Cadastro (WF-04) | CRUD de canteiros previsto no escopo do dashboard | `dashboard/src/__tests__/CanteirosPage.test.tsx` |
| Navegação completa | Dashboard completo mockado / A1.8 | `dashboard/src/__tests__/AppNavigation.test.tsx` |
| Segurança | threat model aplicado | `docs/dashboard/threat-model.md` + `docs/dashboard/evidencias/npm-audit-2026-06-12.txt` |
| Observabilidade | logs + métricas + runbook | `docs/ops/observability-dashboard.md` + `docs/ops/evidencias/observability-console-demo.txt` |

## Como rodar localmente

```bash
cd dashboard
npm install
npm run dev
npm run test
npm run build
npm run audit:deps
```

## O que ficou de fora deliberadamente

- integração real com API / banco da equipe;
- autenticação de usuário no frontend;
- biblioteca externa de gráficos (optamos por SVG/sparkline simples para manter a release leve e sem nova dependência);
- bloqueio obrigatório de `npm audit` na branch protection.

## Diff de stack

- Mantido: **React 18.3.1 + Vite 5.4.8 + TypeScript + Tailwind + Vitest**.
- Decisão adicional nesta release: **sem React Router** e sem Redux; navegação hash-based e estado local são suficientes para 4 telas mockadas.

## Qualidade desta release

- 4 telas com a mesma base de UI e estados.
- Dados mockados realistas derivados do dataset sintético do professor (e cenários de borda controlados).
- Setup documentado no README.
- Logs estruturados e métricas visíveis no próprio app.
