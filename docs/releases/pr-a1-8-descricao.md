<!-- Texto pronto para colar na descrição do PR: feat/a1-8-dashboard-completo-mockado -> development -> main -->
<!-- Regras completas em docs/scm-plan.md -->

## Qual problema isso resolve?

Fecha a **A1.8 — Dashboard Completo Mockado**. A A1.7 (Release 1) provou que a
equipe integra **uma** tela (WF-01 Principal). Este PR replica a mesma barra
para o **dashboard inteiro**: 4 telas E2E com dados mockados, alertas com lógica
concreta, relatório agregado, threat model e observabilidade aplicados,
rastreabilidade e peer-audit.

### O que muda em relação à A1.7

| | A1.7 (Release 1) | A1.8 (este PR) |
|---|---|---|
| Telas | 1 (Principal) | 4 (Principal, Histórico, Alertas, Cadastro) |
| Estados visuais | na tela principal | loading/sucesso/erro/vazio em **todas** |
| Alertas | — | lógica concreta + filtros + ação "Ver no histórico" |
| Relatório | — | resumo semanal (litros + irrigações) |
| Threat model | geral | específico do dashboard (5 ameaças + mitigação real + SCA) |
| Observabilidade | — | logs estruturados + 3 métricas + painel + runbook |
| Testes | 6 | 15 (≥1 por tela + fluxo crítico E2E) |

### Telas/funcionalidades novas

- **WF-02 Histórico**: tabela paginada, filtro, exportação CSV (com proteção contra formula injection), destaque de bordas.
- **WF-03 Alertas**: filtros por canteiro/tipo/período, alerta concreto (umidade < 30%), ação "Ver no histórico".
- **WF-04 Cadastro**: CRUD mockado com validação.
- **Observabilidade** e **threat model** do dashboard; **peer-audit** (recebida + respondida).

## Como foi testado?

- `npm test` → **10 arquivos / 15 testes verdes** (`docs/dashboard/evidencias/vitest-a1-8.txt`).
- `npm run build` (`tsc --noEmit && vite build`) sem erros (`docs/releases/evidencias/vite-build-a1-8.txt`).
- `npm run audit:deps` → **0 vulnerabilidades** (`docs/dashboard/evidencias/npm-audit-a1-8.txt`).
- Observabilidade: logs/métricas capturados (`docs/ops/evidencias/observability-console-demo.txt`).

### Como rodar localmente

```bash
git clone <repo> && cd Projeto-Integrador/dashboard
npm install
npm run dev          # http://localhost:5173 (mock por padrão)
npm test
npm run build
```

## Diff de stack

Mantido **React 18.3.1 + Vite 5.4.8 + TypeScript + Tailwind + Vitest** (alinhado à RFC-001 §5). Divergências registradas como ADR: **ADR-004** (SVG/sparkline em vez de Chart.js) e **ADR-005** (hash routing, sem React Router). Ver `docs/rfc/rfc-001-arquitetura-mvp.md`.

## Relacionado a

Fecha A1.8 · UC-03 / UC-02 / FR-09 · Release 2 (`v0.2.0-dashboard-rc`) · rastreabilidade em `docs/releases/release-2.md` e `docs/test-strategy.md` §1.9.

## Checklist de Pronto

- [x] **Descrição explica o porquê**, não só o quê.
- [x] **Linka o item relacionado** (UC-03/UC-02/FR-09, A1.8).
- [ ] **Pelo menos 1 aprovação** de alguém que não seja o autor.
- [x] **Documentação atualizada** (RFC, test-strategy, release-2, threat-model, observability, audit).
- [x] **Evidência anexada** (vitest/build/npm-audit/observabilidade em `docs/**/evidencias/`).
- [ ] **CI verde** (status check `ci / placeholder`).
