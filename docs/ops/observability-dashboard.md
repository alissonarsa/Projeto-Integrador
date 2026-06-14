# Observability — Dashboard Mockado (A1.8)

## Objetivo

Mostrar, de forma auditável, **o que o usuário vê quando funciona** e **o que o time observa quando falha**. A instrumentação é aplicada ao front, não só descrita.

## O que foi instrumentado

### Logs estruturados

O frontend emite logs JSON com o prefixo `[horta-observability]` para os eventos:

- `app.route.changed`
- `page.view`
- `page.render`
- `fetch.start`
- `fetch.success`
- `fetch.error`
- `alerts.rendered`
- `canteiro.created`
- `canteiro.updated`
- `canteiro.deleted`

Campos principais:

- `ts`
- `level`
- `event`
- `page`
- `requestId`
- `meta`

Implementação: `dashboard/src/utils/observability.ts`

### Métricas mínimas

Foram capturadas nesta release:

- `fetchErrors`: contagem de erros de fetch
- `pageRenderMs[page]`: tempo da primeira renderização por tela
- `alertsRendered`: quantidade de alertas exibidos após filtros

### Painel de debug

O dashboard inclui um `<details>` de **Observabilidade (debug)** que mostra:

- métricas atuais
- últimos logs emitidos

Isso facilita peer-audit e demo sem depender de ferramentas externas.

## Correlação de request id

Cada operação mockada do `MockDashboardClient` gera um `requestId` via `newRequestId(section)`. Esse id aparece em `fetch.start`, `fetch.success` e `fetch.error`, permitindo correlacionar uma tentativa com seu resultado.

## Evidência

- Arquivo de evidência: `docs/ops/evidencias/observability-console-demo.txt`
- Fonte do log: render do dashboard e navegação entre telas em ambiente local

## Runbook mínimo

### Sintoma 1 — Dashboard principal mostra erro persistente na carga inicial

1. Abrir o painel **Observabilidade (debug)**.
2. Verificar se há `fetch.error` com `section = dashboard`.
3. Conferir se o `DashboardClient` selecionado é o mock esperado.
4. Clicar em **Tentar novamente**.
5. Se persistir, revisar `dashboard/src/data/dashboardClient.ts` e `mockDashboardClient.ts`.

### Sintoma 2 — Alertas não aparecem, mas o dashboard mostra umidade crítica

1. Ir para a tela **Alertas**.
2. Verificar a métrica `alertsRendered`.
3. Conferir filtros ativos (`canteiro`, `tipo`, `período`).
4. Inspecionar logs `alerts.rendered` no painel de debug.
5. Validar fixture em `dashboard/src/data/mocks/fixtures.ts`.

### Sintoma 3 — Histórico exporta CSV vazio ou quebrado

1. Verificar se a tabela contém linhas filtradas.
2. Acionar exportação e conferir logs do navegador.
3. Revisar `dashboard/src/utils/csv.ts`.
4. Validar se o filtro atual não zerou o dataset.

## Próximo passo (v0.2)

- enviar logs para backend / collector real;
- distinguir `warn` operacional de `error` funcional com telemetria externa;
- capturar erro global de runtime com boundary e evento dedicado.
