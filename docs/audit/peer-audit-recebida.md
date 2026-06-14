# Peer-audit recebida — Dashboard A1.8

| Campo | Valor |
|:---|:---|
| Equipe auditada | Horta Inteligente (Leonardo, Alisson, Luisa) |
| Equipe auditora | Equipe revisora (rodada de peer-audit cruzado — Aula 18) |
| Data | 2026-06-14 |
| Escopo | `dashboard/`, `docs/dashboard/`, `docs/ops/`, `docs/releases/`, RFC-001, test-strategy |
| Rubrica | Checklist A1.8 (cobertura · threat model/observabilidade · aderência/portfólio) |

> **Nota de honestidade.** A rodada de peer-audit cruzado oficial entre equipes
> não ocorreu para esta turma. Para não deixar o critério vazio nem simular
> elogio, este documento registra uma **auditoria crítica real** do dashboard
> feita com o checklist da rubrica, apontando fraquezas concretas (não
> cordialidade). Deve ser **substituído pela auditoria cruzada oficial** caso
> ela aconteça. A resposta da equipe está em `peer-audit-respondida.md`.

## Resumo do auditor

O dashboard é sólido em cobertura (4 telas, 4 estados, fetch isolado) e tem
threat model e observabilidade reais. Os problemas concentram-se em
**rastreabilidade e honestidade de evidência** (critério 3) e em **uma alegação
de mitigação que o código não cumpria** (critério 2). Peer-audit existe para
quebrar evidência fraca — segue a lista.

## Achados

| # | Sev. | Critério | Achado | Evidência | Recomendação |
|:--|:--|:--|:--|:--|:--|
| F1 | Alto | 1/3 | O único teste "E2E" (`AppNavigation`) **só clica nos botões de menu**. Não cobre um fluxo de tarefa real (ex.: ver um alerta e ir investigá-lo). Alertas não eram acionáveis. | `__tests__/AppNavigation.test.tsx` | Adicionar fluxo crítico com navegação acionada por dado. |
| F2 | Alto | 3 | Os testes do dashboard **não estavam ancorados** na matriz risco→teste da A1.6; a matriz ainda dizia que aceitação do dashboard "não é automatizada". Sem diff de atualização. | `docs/test-strategy.md` §1.3–1.4 | Atualizar a matriz com diff visível ligando cada teste a um risco. |
| F3 | Médio | 3 | Divergência de stack não registrada como ADR: a RFC-001 §5 **pina Chart.js 4.4.3**, mas a implementação usa SVG próprio. Release notes mencionam de passagem; sem ADR. | RFC-001 §5 vs `components/Sparkline.tsx` | Registrar ADR de divergência (a rubrica exige). |
| F4 | Médio | 2 | **Threat model theater**: a tabela declara que a exportação CSV mitiga *formula injection* via `escapeCsvValue()`, mas o código **só escapava aspas/`;`** — não neutralizava `= + - @`. Um canteiro chamado `=cmd()` exportaria fórmula viva. | `utils/csv.ts` vs `threat-model.md` (linha de export) | Implementar a mitigação de verdade + teste. |
| F5 | Médio | 2 | Evidência de SCA com **link quebrado**: docs apontam para `npm-audit-2026-06-12.txt`, arquivo inexistente (o real é `npm-audit-a1-8.txt`). Lê-se como "log não anexado". | `threat-model.md`, `release-2.md` | Corrigir referência e regerar evidência da release. |
| F6 | Médio | 3 | Inconsistência A1.4 ↔ A1.8: na RFC **WF-02 = "Detalhe do Canteiro"**; na entrega **WF-02 = "Histórico"**. O fluxo UC-03/A2 (clicar no card → detalhe) não existe e não há explicação. | RFC-001 §8 vs `pages/HistoryPage.tsx` | Reconciliar o rótulo e registrar a dívida do detalhe. |
| F7 | Baixo | 3 | **Tag de release ausente** apesar de release notes prontas (`git tag` vazio). | `git tag -l` | Criar a tag da RC. |
| F8 | Baixo | 1 | Os mocks afirmam ser "derivados do dataset sintético", mas o dataset **não havia sido gerado** e o `como-usar-dados-sinteticos.md` citado na atividade **não existia** no repo. | `dados/` | Gerar o dataset (evidência) + how-to + redação honesta. |
| F9 | Baixo | 2 | Evidências de observabilidade/teste foram geradas em **máquinas diferentes** (paths `/mnt/data/...` e `C:/dev/...`), levantando dúvida de reprodutibilidade. | `docs/ops/evidencias/observability-console-demo.txt` | Regerar no ambiente da entrega. |
| F10 | Baixo | 2 | `HttpDashboardClient` interpola a `baseUrl` na mensagem de erro lançada — config de ambiente potencialmente vazando em logs do front. | `data/httpDashboardClient.ts` | Avaliar remover a URL da mensagem ou aceitar como dívida. |
| F11 | Baixo | 1 | Responsividade é afirmada (Tailwind), mas **não há teste automatizado** que a comprove; evidência é manual. | `App.tsx`, páginas | Aceitar como dívida ou adicionar teste de viewport. |

## Leitura por critério (visão do auditor, no estado auditado)

- **Critério 1 — Cobertura:** Nível 3–4. As 4 telas funcionam com estados; o E2E fraco (F1) e a alegação de dados (F8) puxam para baixo.
- **Critério 2 — Threat model + observabilidade:** Nível 3. Instrumentação real e 5 ameaças, mas o *theater* do CSV (F4) e o link quebrado (F5) são exatamente o tipo de coisa que a rubrica penaliza.
- **Critério 3 — Aderência/portfólio:** Nível 2. Matriz não ancorada (F2), divergência sem ADR (F3), inconsistência WF-02 (F6) e tag ausente (F7).

## Pontos fortes reconhecidos (sem inflar)

- Camada de fetch isolada (`DashboardClient` + Mock/Http + factory) é genuinamente plugável.
- Observabilidade instrumentada de fato (logs + métricas + runbook), não declarada.
- Bordas mockadas variadas (offline/parcial/suspeita/manual), não "teste 1, teste 2".
