# Release 2 / RC — Dashboard Completo Mockado (v0.2.0-dashboard-rc)

| Campo | Valor |
|:---|:---|
| Tag | `v0.2.0-dashboard-rc` |
| Data | 2026-06-14 |
| Entrega | A1.8 |
| Marco | A1 final do dashboard (Release Candidate) |
| Base | Release 1 / A1.7 (`v0.1.0-dashboard`) |

## O que entrou desde a Release 1 (A1.7)

A Release 1 entregou **1 tela** (WF-01 Principal / UC-03). A Release 2 replica a
mesma barra de qualidade para o **dashboard inteiro**:

1. **WF-01 Principal** — status dos canteiros + sparklines (temp/umidade/luz) + KPIs + **relatório agregado semanal** (litros e irrigações por semana).
2. **WF-02 Histórico** — tabela paginada ("carregar mais"), filtro por canteiro, **exportação CSV** e destaque de bordas (offline, parcial, suspeita).
3. **WF-03 Alertas** — filtros por canteiro/tipo/período, **lógica concreta** (umidade do solo < 30%, sensor offline, leitura suspeita, irrigação manual) e ação **"Ver no histórico"** que liga o alerta à investigação.
4. **WF-04 Cadastro de canteiros** — CRUD mockado com validação, edição e exclusão.
5. **Estados de erro consistentes** em todas as telas (loading/sucesso/erro/vazio) — não só na tela da A1.7.
6. **Observabilidade no front** — logs estruturados, 3 métricas, painel de debug e runbook.
7. **Threat model do dashboard** — 5 ameaças concretas + mitigação/dívida + evidência de SCA.
8. **Testes ampliados** — ≥1 por tela + fluxo crítico E2E; matriz risco→teste da A1.6 atualizada (diff visível).

## Rastreabilidade end-to-end (UC → componente → teste → linha do release)

| Tela / artefato | UC / req | Componente(s) | Teste-âncora | Linha do release |
|---|---|---|---|---|
| WF-01 Principal | UC-03 (status) + relatório | `pages/Dashboard.tsx`, `components/CanteiroCard.tsx`, `KpiCard.tsx`, `Sparkline.tsx`, `hooks/useDashboardData.ts` | `__tests__/Dashboard.test.tsx` → "renderiza cards dos 4 canteiros e relatório agregado…" / "mostra estado de erro…" | item 1 |
| WF-02 Histórico | UC-03 (histórico/auditoria visual) | `pages/HistoryPage.tsx`, `utils/csv.ts`, `utils/tempo.ts` | `__tests__/HistoryPage.test.tsx` → "carrega histórico e expõe ação de exportação csv" | item 2 |
| WF-03 Alertas | UC-02/UC-03 (alerta por condição) | `pages/AlertsPage.tsx`, `components/PageState.tsx` | `__tests__/AlertsPage.test.tsx` → "renderiza alerta concreto de umidade crítica" | item 3 |
| WF-04 Cadastro | FR-09 (CRUD de canteiros) | `pages/CanteirosPage.tsx`, `data/mockDashboardClient.ts` | `__tests__/CanteirosPage.test.tsx` → "valida formulário e cria novo canteiro" | item 4 |
| Fluxo crítico E2E | UC-03 (navegação por dado) | `App.tsx` + `AlertsPage.tsx` (ação "Ver no histórico") | `__tests__/CriticalFlow.test.tsx` → "fluxo crítico: principal → alertas → vê alerta → vai para o histórico"; `AppNavigation.test.tsx` | item 5 |
| Observabilidade | NFR (logs + métricas + runbook) | `utils/observability.ts`, `hooks/usePageRenderMetric.ts`, `components/ObservabilityPanel.tsx` | `__tests__/Observability.test.tsx` | item 6 |
| Camada de fetch isolada | UC-03 (plugável à API real) | `data/dashboardClient.ts`, `mockDashboardClient.ts`, `httpDashboardClient.ts`, `data/types.ts` | `__tests__/mockClient.test.tsx` | itens 1–4 |
| Segurança | threat model aplicado | — (decisões de render/escape) | `docs/dashboard/threat-model.md` + `docs/dashboard/evidencias/npm-audit-a1-8.txt` | item 7 |

> Detalhe da âncora teste→risco na matriz da A1.6: `docs/test-strategy.md` §1.9.

## Sistema de alertas e relatório agregado

- **Alerta concreto** disparando por condição mockada: `umidade-critica` (umidade do solo < 30%), além de `sensor-offline`, `leitura-suspeita` e `irrigacao-manual`. Filtros por canteiro/tipo/período em `pages/AlertsPage.tsx`.
- **Relatório agregado**: resumo semanal de **litros consumidos** e **contagem de irrigações** por semana, exibido na Principal (`getResumoSemanal`).

## Breaking changes e migração

- **Sem breaking change de runtime.** A única mudança de assinatura é interna: `AlertsPage` passou a aceitar a prop **opcional** `onNavigate` (usada pelo `App` para a ação "Ver no histórico"). Componentes que renderizam `AlertsPage` sem essa prop continuam funcionando.
- Migração para API real: trocar o provider em `dashboard/src/data/dashboardClient.ts` (o `HttpDashboardClient` já existe como fronteira). Nenhum componente muda.

## Issues fechadas / PRs mergeados

- A1.7 (Release 1): PR `feat/dashboard-geral` → `development` → `main` (WF-01).
- A1.8 (esta release): PR `feat/a1-8-dashboard-completo-mockado` → `development` → `main` (WF-02/03/04 + alertas + relatório + threat model + observabilidade + correções de rastreabilidade desta auditoria).
- Dados sintéticos: branch `dados` (gerador + how-to) integrada a `feat/a1-8`.

## Como rodar localmente

```bash
git clone <repo> && cd Projeto-Integrador/dashboard
npm install
npm run dev          # app em http://localhost:5173 (mock por padrão)
npm test             # vitest run — 9 arquivos / 12 testes
npm run build        # tsc --noEmit && vite build
npm run audit:deps   # npm audit --omit=dev --audit-level=high
```

Dataset sintético (opcional, para o Marco 4): `cd dados && python3 2026-05-26--gerar-dados-sinteticos.py --seed 42` (ver `dados/como-usar-dados-sinteticos.md`).

## Diff de stack (ADRs atualizados na RFC-001)

- Mantido: **React 18.3.1 + Vite 5.4.8 + TypeScript + Tailwind + Vitest** (alinhado à §5 da RFC-001).
- **Divergência registrada como ADR**: **ADR-004** — visualização com **SVG/sparkline próprio em vez de Chart.js** (a RFC pina Chart.js; reintroduzido no Marco 4). **ADR-005** — navegação **hash-based, sem React Router/Redux**.

## O que ficou de fora deliberadamente

- Integração real com API / banco da equipe (Marco 4).
- Autenticação de usuário no frontend.
- Detalhe do canteiro com gráficos 24 h (WF-02 original da RFC) — dívida registrada na RFC §8.
- Bloqueio obrigatório de `npm audit` na branch protection.

## Qualidade desta release

- 4 telas com a mesma base de UI e os 4 estados visuais.
- Dados mockados realistas, consistentes com o dataset sintético + cenários de borda controlados.
- Setup documentado; build, testes e SCA verdes (evidências em `docs/dashboard/evidencias/` e `docs/releases/evidencias/`).
- Logs estruturados e métricas visíveis no próprio app.
