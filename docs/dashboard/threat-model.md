# Threat Model — Dashboard Mockado (A1.8)

## Escopo

Threat model focado especificamente no **dashboard web** da Horta Inteligente. Complementa o threat model geral do sistema com ênfase no que o frontend mostra, filtra, exporta e registra em log.

## Ativos protegidos

- **Dados exibidos**: leituras dos sensores, eventos de irrigação, relatório agregado semanal.
- **Camada de fetch**: contratos consumidos pelo dashboard (`getCanteiros`, `getLeiturasUltimas`, `getAlertas`, `getHistoricoLeituras`).
- **Credenciais / configuração**: base URL futura da API real, eventuais headers de autenticação.
- **Exportação e filtros**: parâmetros de busca, CSV exportado, nomes de canteiros renderizados.

## Tabela de ameaças

| Ativo | STRIDE | Ameaça concreta | Mitigação aplicada / decisão | NFR-alvo | Evidência |
|---|---|---|---|---|---|
| Nomes e cultura dos canteiros renderizados no front | Tampering / Information disclosure | **XSS no nome de canteiro** (ex.: nome vindo de cadastro/API contendo `<script>` ou HTML malicioso) | O dashboard usa **renderização padrão do React**, sem `dangerouslySetInnerHTML`; o formulário trata nome como dado e não injeta HTML. | Segurança / integridade da interface | Código do formulário em `dashboard/src/pages/CanteirosPage.tsx`; render em `dashboard/src/components/CanteiroCard.tsx`. |
| Logs estruturados do frontend | Information disclosure | **Exposição de credenciais Wi‑Fi do ESP32 ou token da API em logs do front** | A instrumentação registra só **eventos, requestId e metadados permitidos** (contagem, seção, duração). Não há log de payload bruto nem de segredo. | Confidencialidade | `dashboard/src/utils/observability.ts` usa allowlist explícita de campos; evidência em `docs/ops/evidencias/observability-console-demo.txt`. |
| Requests futuros do `HttpDashboardClient` | Information disclosure | **Dados em trânsito sem TLS** quando o mock for trocado pela API real | Para A1.8 a release é **100% mockada**; a troca para API real fica registrada como dívida técnica: `HttpDashboardClient` existe como fronteira, mas ainda não faz fetch. Na v0.2 / Marco 4, exigir `https` em produção e documentar pinagem de base URL por ambiente. | Segurança em trânsito | `dashboard/src/data/httpDashboardClient.ts` + Release 2; dívida registrada, não escondida. |
| Filtros e exportação de histórico | Tampering | **Injeção em filtros / CSV formula injection** ao exportar linha começando com `=` ou `+` | Filtros são tipados no estado React (selects controlados); exportação passa por `escapeCsvValue()` e não concatena HTML. | Integridade / segurança de exportação | `dashboard/src/utils/csv.ts`; teste manual descrito em release-2. |
| Visualização de leituras | Tampering | **Leitura suspeita aceita silenciosamente** (ex.: temperatura 52.4°C em canteiro externo) e induz o usuário ao erro | A tela de histórico destaca a linha como suspeita; a página de alertas gera alerta específico; a principal mostra estado anômalo sem “normalizar” silenciosamente o dado. | Transparência / auditabilidade | `dashboard/src/pages/HistoryPage.tsx`, `dashboard/src/pages/AlertsPage.tsx`, mock em `dashboard/src/data/mocks/fixtures.ts`. |

## Evidência de scanning (SCA)

- Ferramenta: `npm audit --omit=dev --audit-level=high`
- Escopo: dependências de runtime do dashboard mockado
- Evidência anexada: `docs/dashboard/evidencias/npm-audit-2026-06-12.txt`

## Dívida técnica aceita nesta release

1. **TLS real ainda não exercitado**: como a release A1.8 é deliberadamente mockada, a comunicação HTTPS com API real não foi validada em runtime.
2. **Autenticação de usuário não implementada no front**: não há credencial real para proteger rotas nesta release.
3. **Scanner automatizado no CI ainda não bloqueia merge**: a evidência existe, mas o check técnico ainda não foi promovido a branch protection obrigatória.

## Próximo passo (Marco 4 / v0.2)

- ligar `HttpDashboardClient` à API real;
- promover audit de dependências a workflow separado;
- reavaliar a linha de TLS com evidência runtime;
- adicionar autenticação no front se a API real exigir.
