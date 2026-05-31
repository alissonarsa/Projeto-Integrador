# Release 1 — Dashboard (v0.1.0-dashboard)

| Campo | Valor |
|:------|:------|
| Tag | `v0.1.0-dashboard` |
| Data | 2026-05-31 |
| Entrega | A1.7 |
| Marco | Marco 3 do PI |

## O que entrou nesta release

- **Tela:** Dashboard Geral (WF-01 / UC-03) funcionando ponta a ponta com dados mockados.
- **Componentes:** `Dashboard` (página), `CanteiroCard`, `ConnectionBanner`, hook `useDashboardData` (polling 30s).
- **Camada de fetch isolada:** interface `DashboardClient` + `MockDashboardClient` (trocável por API real sem mudar componentes).
- **Mocks:** `fixtures.ts` com leituras realistas e dois fixtures degradados (sensor de solo nulo; leitura desatualizada).
- **Testes:** suíte Vitest (6 testes) cobrindo campo nulo, dados desatualizados, caminho feliz e erro de carga.
- **CI:** workflow `dashboard-tests.yml`.

## O que ficou de fora deliberadamente (vai para A1.8 / v0.2)

- Telas WF-02 (detalhe + gráficos Chart.js), WF-03 (alertas) e WF-04 (cadastro).
- `HttpDashboardClient` e integração com a API real (só o ponto de troca existe).
- Acceptance automatizado completo do dashboard, testes de performance e de segurança.

## Issues / PRs fechados

- PR `feat/dashboard-geral` → `main` (preencher número ao abrir).

## Rastreabilidade (item → UC → teste)

| Item entregue | UC | Teste |
|:--------------|:---|:------|
| Cards de status com dados realistas | UC-03 (fluxo principal) | `Dashboard.test.tsx` → "renderiza um card por canteiro" |
| Fallback de campo nulo / sensor falho | UC-03 E4 (matriz A1.6, linha acceptance) | `CanteiroCard.test.tsx` → "exibe fallback e alerta quando umidade do solo é nula" |
| Indicador de dados desatualizados | UC-03 E3 | `CanteiroCard.test.tsx` → "marca dados desatualizados" |
| Estado de API offline na carga | UC-03 E1 | `Dashboard.test.tsx` → "mostra erro e botão Tentar novamente" |
| Camada de fetch isolada / mock | UC-03 (fluxo principal) | `mockClient.test.tsx` |
