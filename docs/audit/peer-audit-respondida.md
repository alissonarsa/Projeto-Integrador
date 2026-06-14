# Resposta da equipe à peer-audit — Dashboard A1.8

| Campo | Valor |
|:---|:---|
| Equipe | Horta Inteligente (Leonardo, Alisson, Luisa) |
| Responde a | `peer-audit-recebida.md` (2026-06-14) |
| Data | 2026-06-14 |
| Política | Cada achado é **Corrigido** (com evidência) ou **Dívida aceita** (com justificativa de risco). |

## Resumo

Dos 11 achados, **9 foram corrigidos nesta release** e **2 aceitos como dívida
de baixo risco** com justificativa. As correções estão refletidas no código,
nos docs e nas evidências regeradas. Suíte após as correções:
**10 arquivos / 15 testes verdes**, build e `npm audit` (0 vulnerabilidades) ok.

## Resposta ponto a ponto

| # | Status | O que fizemos | Evidência |
|:--|:--|:--|:--|
| F1 | ✅ Corrigido | Adicionamos a ação **"Ver no histórico"** nos cards de alerta (`AlertsPage` recebe `onNavigate` do `App`) e um teste E2E de **fluxo crítico**: principal → alertas → vê alerta concreto → clica → histórico. | `__tests__/CriticalFlow.test.tsx`, `pages/AlertsPage.tsx`, `App.tsx` |
| F2 | ✅ Corrigido | Atualizamos a matriz risco→teste para **v0.2** com **diff visível** (o que mudou de v0.1→v0.2) e uma tabela ligando **cada teste do dashboard a um risco/UC**. | `docs/test-strategy.md` §1.9 |
| F3 | ✅ Corrigido | Registramos **ADR-004** (SVG/sparkline em vez de Chart.js) e **ADR-005** (hash routing em vez de React Router) na RFC; versão da RFC → v0.3. | `docs/rfc/rfc-001-arquitetura-mvp.md` §7 |
| F4 | ✅ Corrigido | `escapeCsvValue()` agora **prefixa com aspa simples** valores iniciados por `= + - @` (tab/CR), neutralizando formula injection de verdade. Teste unitário cobre o caso. Threat model reescrito para descrever o mecanismo real. | `utils/csv.ts`, `__tests__/csv.test.ts`, `threat-model.md` |
| F5 | ✅ Corrigido | Corrigimos as referências para `npm-audit-a1-8.txt` e **regeramos** a evidência de SCA nesta máquina (0 vulnerabilidades). | `docs/dashboard/evidencias/npm-audit-a1-8.txt`, `threat-model.md`, `release-2.md` |
| F6 | ✅ Corrigido | Adicionamos **nota de reconciliação** explicando o rescopo de WF-02 ("Detalhe" → "Histórico") e registramos o detalhe do canteiro como dívida do Marco 4. | RFC-001 §8, `page-dashboard-completo.md` |
| F7 | ✅ Corrigido | Criamos a tag **`v0.2.0-dashboard-rc`** no commit da release. | `git tag` |
| F8 | ✅ Corrigido | Geramos o dataset (`--seed 42`, 207.360 leituras) com evidência; criamos o `como-usar-dados-sinteticos.md` ausente; ajustamos a redação dos mocks para "fatias representativas + bordas" (honesto). Pasta gerada vai para `.gitignore`. | `dados/como-usar-dados-sinteticos.md`, `dados/evidencias/geracao-dados-sinteticos.txt` |
| F9 | ✅ Corrigido | Regeramos as evidências de teste/observabilidade **nesta máquina** (caminho do repo local), removendo o smell de path `/mnt/data`. | `docs/dashboard/evidencias/vitest-a1-8.txt`, `docs/ops/evidencias/observability-console-demo.txt` |
| F10 | 🟡 Dívida aceita | A `baseUrl` é **configuração de ambiente, não segredo** (não há token nela nesta release). Risco baixo. Planejamos remover a URL da mensagem de erro ao ligar a API real (Marco 4), junto com a exigência de HTTPS. | Registrado aqui + `threat-model.md` (dívidas) |
| F11 | 🟡 Dívida aceita | Responsividade validada **manualmente** (breakpoints Tailwind `sm/md/lg`, tabela com scroll horizontal, cards empilham < 768px conforme UC-03/A1). Teste de viewport automatizado fica para a v0.2. | `App.tsx`, páginas |

## Aprendizado registrado

O achado mais valioso foi o **F4 (threat model theater)**: tínhamos uma
mitigação **declarada** que o código não cumpria. Trocamos a declaração por
**código + teste**. Isso vira regra da equipe: toda linha de mitigação do threat
model precisa apontar para código verificável ou ser explicitamente dívida.
