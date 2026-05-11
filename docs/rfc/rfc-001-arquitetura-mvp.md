# RFC-001 — Arquitetura MVP da Horta Inteligente

## 1. Cabeçalho

| Campo | Valor |
|:------|:------|
| Projeto | Horta Inteligente |
| Status | Aceita para o MVP do Marco 2 e usada como base da A1.6 |
| Versão | v0.2 |
| Data | 2026-05-10 |
| Autores | Leonardo Rossetti, Alisson Silva, Luisa Felix |
| Repositório | `Projeto-Integrador` |
| Artefatos-base | [`../requirementents/srs.md`](../requirementents/srs.md), [`../requirementents/use-cases.md`](../requirementents/use-cases.md), [`../requirementents/backlog.md`](../requirementents/backlog.md) |
| Marco do PI | Marco 2 (arquitetura definida) com continuidade no Marco 3 |

---

## 2. Contexto e Motivação

A Horta Inteligente é um sistema físico-digital para monitorar variáveis ambientais dos canteiros, registrar leituras históricas e apoiar a irrigação automática com base em limiares objetivos. O valor do projeto não mora só no hardware nem só no software: ele mora na integração entre **sensores**, **ESP32**, **API REST**, **banco de dados** e **dashboard web**.

A arquitetura deste MVP precisa responder a três dores reais do PI:

1. O responsável pela horta precisa visualizar rapidamente o estado atual dos canteiros e saber quando houve leitura recente, alerta ou irrigação.
2. A equipe precisa de uma fronteira clara entre firmware, backend e dashboard para conseguir trabalhar em paralelo sem quebrar a integração.
3. O projeto precisa ser simples o suficiente para o semestre, mas já deixar rastreabilidade clara para testes, RFCs futuras e evolução no Marco 4.

O princípio orientador desta RFC é: **priorizar integração verificável e simplicidade operacional**, em vez de arquitetura sofisticada demais para um time pequeno e um cronograma curto.

---

## 3. Escopo deste Marco

### Dentro do escopo do MVP

- Receber leituras ambientais de temperatura, umidade do ar, umidade do solo e luminosidade.
- Persistir leituras e eventos de irrigação em banco relacional.
- Disponibilizar endpoints REST para ingestão e leitura dos dados.
- Exibir dashboard web com status atual, histórico básico e alertas visuais.
- Documentar decisões estruturais que impactam firmware, backend e front.

### Fora do escopo deste Marco

- Aplicativo mobile nativo.
- Operação offline completa do dashboard.
- Alta disponibilidade, filas, orquestração ou arquitetura distribuída complexa.
- Modelos preditivos ou machine learning para irrigação.
- Automação de campo definitiva com observabilidade completa e telemetria avançada.

---

## 4. Requisitos Atendidos e Rastreabilidade

### Requisitos funcionais centrais atendidos por esta arquitetura

- [`FR-01`](../requirementents/srs.md): coleta periódica de leituras via ESP32.
- [`FR-02`](../requirementents/srs.md): acionamento de irrigação com base em limiares.
- [`FR-03`](../requirementents/srs.md): registro persistente de eventos de irrigação.
- [`FR-04`](../requirementents/srs.md): gráficos por canteiro no dashboard.
- [`FR-05`](../requirementents/srs.md): status atual de cada canteiro.
- [`FR-06`](../requirementents/srs.md): proteção contra irrigação duplicada no mesmo canteiro.

### Casos de uso que ancoram a arquitetura

- [`UC-01`](../requirementents/use-cases.md): Coletar Leitura dos Sensores.
- [`UC-02`](../requirementents/use-cases.md): Acionar Irrigação Automática.
- [`UC-03`](../requirementents/use-cases.md): Visualizar Status dos Canteiros.

### Mapa UC → componente

| UC | Componentes principais |
|:---|:-----------------------|
| UC-01 | Sensores + ESP32 + `POST /leituras` + banco de dados |
| UC-02 | ESP32 + regra de decisão + `POST /irrigacoes` / `PATCH /irrigacoes/{id}` + dashboard de alertas |
| UC-03 | `GET /canteiros` + `GET /leituras/ultimas` + dashboard web |

Esse mapa existe para permitir análise de impacto. Quando um UC mudar, a equipe sabe em quais componentes olhar primeiro. Quando um componente falhar, a equipe sabe quais UCs ficam comprometidos.

---

## 5. Stack Tecnológica (pinada)

| Camada | Tecnologia | Versão pinada | Justificativa curta |
|:-------|:-----------|:--------------|:--------------------|
| Firmware edge | ESP32 DevKit + Arduino Core | 3.0.7 | Plataforma já prevista no PI, com Wi-Fi integrado e curva menor para o semestre. |
| Sensores | DHT22, capacitivo de solo, LDR | hardware definido no PI | Cobrem as variáveis mínimas do escopo e já foram assumidos nos requisitos. |
| Backend API | Python | 3.12.3 | Stack com boa produtividade para APIs e testes automatizados. |
| Framework API | FastAPI | 0.115.0 | Facilita modelagem de contratos JSON, validação e documentação futura de endpoints. |
| Validação e modelos | Pydantic | 2.9.2 | Ajuda a congelar o contrato da API e reduz payload inválido. |
| Banco relacional | PostgreSQL | 16.2 | Bom suporte a consultas temporais, integridade relacional e evolução da API. |
| Frontend | React | 18.3.1 | Bom ecossistema para dashboard, componentes e gráficos. |
| Build frontend | Vite | 5.4.8 | Setup rápido e simples para o time. |
| Visualização | Chart.js | 4.4.3 | Suficiente para gráficos do histórico do canteiro. |
| CI | GitHub Actions | hosted runner | Integra com o fluxo de PR já definido no SCM. |

### Observação de arquitetura

A stack acima é a **stack-alvo documentada**. Ela é a referência para o projeto, ainda que nem todos os módulos já estejam implementados no repositório nesta data. A RFC existe exatamente para registrar esse alvo antes da implementação completa.

---

## 6. Arquitetura do Sistema

### 6.1 Diagrama de componentes (ASCII)

```text
+--------------------+        HTTP/JSON         +-----------------------+
| Sensores           |  leitura / regra local   | API REST (FastAPI)    |
| DHT22 / Solo / LDR | ----> ESP32 -----------> | /leituras /irrigacoes |
+--------------------+                          +-----------+-----------+
                                                            |
                                                            | SQL
                                                            v
                                                  +-----------------------+
                                                  | PostgreSQL            |
                                                  | leituras / irrigacoes |
                                                  +-----------+-----------+
                                                              |
                                                              | HTTP/JSON
                                                              v
                                                  +-----------------------+
                                                  | Dashboard Web         |
                                                  | status / alertas      |
                                                  | historico / relatorio |
                                                  +-----------------------+
```

### 6.2 Fluxos principais de dados

#### Fluxo A — Ingestão de leitura
1. O ESP32 lê os sensores no intervalo configurado.
2. O firmware monta o payload com `canteiro_id`, `temperatura`, `umidade_ar`, `umidade_solo`, `luminosidade` e `timestamp`, enviando a chave de autenticação prevista para a API.
3. A API recebe o `POST /leituras`, valida o contrato e persiste a leitura.
4. O dashboard consome as leituras mais recentes via endpoint de consulta.

> **Nota de alinhamento com a A1.6.** A evidência executável desta etapa usa a **API de referência da aula**, cujo contrato é propositalmente simplificado (`device_id`, `sensor`, `valor`, `timestamp`) para demonstrar contract testing antes da API da equipe estar pronta. Esse stub didático **não substitui** o contrato-alvo descrito pelos UCs e pelo SRS desta RFC.

#### Fluxo B — Irrigação automática
1. O ESP32 avalia umidade do solo e luminosidade.
2. Se a condição de irrigação for atendida e não houver irrigação ativa, o relé é acionado.
3. A API registra o evento de irrigação.
4. O dashboard passa a refletir o novo estado do canteiro e eventual alerta associado.

#### Fluxo C — Visualização do status
1. O usuário acessa o dashboard.
2. O frontend chama a API para obter canteiros e últimas leituras.
3. O sistema renderiza cartões, gráficos e alertas usando os dados persistidos.
4. A atualização periódica repete a consulta em intervalo curto.

### 6.3 Fronteiras relevantes para testes

As fronteiras arquiteturais que concentram mais risco neste MVP são:
- **ESP32 ↔ API**: contrato HTTP/JSON e semântica de erro.
- **API ↔ banco**: persistência correta, ordenação temporal e integridade dos registros.
- **API ↔ dashboard**: consistência de schema para visualização, fallback e alertas.

---

## 7. ADRs

### ADR-001 — Persistência relacional com PostgreSQL

**Contexto.** O sistema precisa guardar leituras por tempo, consultar histórico por canteiro e registrar eventos de irrigação com relação clara entre entidades.

**Decisão.** Usar **PostgreSQL 16.2** como banco principal do MVP, com modelagem relacional para `canteiros`, `leituras` e `irrigacoes`.

**Alternativas consideradas.**
- **SQLite:** rejeitado porque simplifica o setup, mas complica concorrência e evolução quando API e dashboard passarem a crescer juntos.
- **Firebase / NoSQL:** rejeitado porque facilita backend inicial, mas dificulta consultas temporais e integridade relacional do histórico de irrigação.

**Consequências.** Ganhamos consultas mais previsíveis, integridade referencial e um caminho mais limpo para relatórios e histórico. Pagamos o custo de operar um SGBD relacional e de modelar tabelas e índices corretamente.

**Quando não usar.** Se o sistema migrar para altíssimo volume de time-series, com necessidade de downsampling e retenção específica por janela temporal, essa decisão deve ser reavaliada.

---

### ADR-002 — Comunicação ESP32 ↔ backend por HTTP/REST

**Contexto.** O semestre exige integração verificável cedo, e o time precisa de um protocolo simples para firmware, testes e API de referência da aula.

**Decisão.** Usar **HTTP/REST com JSON** como protocolo entre ESP32 e backend no MVP.

**Alternativas consideradas.**
- **MQTT:** rejeitado porque é interessante para IoT, mas adiciona broker, tópicos e complexidade operacional acima do que o time precisa para o Marco 2/3.
- **Comunicação serial direta sem API:** rejeitada porque inviabiliza dashboard web, persistência central e contratos claros para integração entre módulos.

**Consequências.** Ganhamos simplicidade, rastreabilidade e alinhamento com o stub de API usado em aula e nos testes de contrato. Pagamos o custo de um protocolo menos otimizado para cenários IoT muito grandes.

**Quando não usar.** Se o projeto evoluir para muitos dispositivos, conectividade instável em escala e necessidade forte de mensagens assíncronas, MQTT deve ser reavaliado.

---

### ADR-003 — Dashboard web em React consumindo API separada

**Contexto.** O dashboard precisa mostrar status, histórico, alertas e telas administrativas sem misturar diretamente a lógica de UI com persistência.

**Decisão.** Manter o **dashboard web em React 18.3.1** consumindo uma **API separada**.

**Alternativas consideradas.**
- **Renderização server-side acoplada ao backend:** rejeitada porque reduz a separação entre API e interface e dificulta evolução paralela.
- **Vue:** rejeitado não por inferioridade técnica, mas porque o time já vinha organizando o material mental do dashboard no ecossistema React.

**Consequências.** Ganhamos separação de responsabilidades e fronteira clara para testes entre provider e consumidor. Pagamos o custo de duas camadas distintas para subir e testar.

**Quando não usar.** Se o sistema for reduzido no futuro para uma interface administrativa mínima e estática, essa separação pode ser simplificada.

---

## 8. Telas / Wireframes (textuais)

> Como o repositório atual não traz assets gráficos da A1.4, os wireframes abaixo foram reconstruídos em formato textual para manter a RFC completa e rastreável. Eles já linkam os UCs e podem ser substituídos por PNG/Figma depois, sem quebrar a estrutura.

### WF-01 — Dashboard Geral (`UC-03`)

```text
+-------------------------------------------------------------+
| Horta Inteligente                                           |
| Ultima sincronizacao: 14:35                                 |
+-------------------------------------------------------------+
| [Canteiro A]  Solo: 38%  Temp: 24.5  Luz: 320  Irrigacao: ON |
| [Canteiro B]  Solo: 52%  Temp: 25.1  Luz: 610  Irrigacao: OFF|
| [Canteiro C]  Solo: --   Temp: 23.8  Luz: 280  Alerta: sensor|
+-------------------------------------------------------------+
| Alertas recentes | Historico | Relatorio semanal            |
+-------------------------------------------------------------+
```

### WF-02 — Detalhe do Canteiro (`UC-03`)

```text
+-------------------------------------------------------------+
| Canteiro A                                                  |
| Ultima leitura: 14:35                                       |
+-------------------------------------------------------------+
| Grafico temperatura (24h)                                   |
| Grafico umidade do solo (24h)                               |
| Grafico umidade do ar (24h)                                 |
| Grafico luminosidade (24h)                                  |
+-------------------------------------------------------------+
| Historico de irrigacoes                                     |
+-------------------------------------------------------------+
```

### WF-03 — Alertas e Irrigações (`UC-02`, `UC-03`)

```text
+-------------------------------------------------------------+
| Alertas                                                     |
+-------------------------------------------------------------+
| [Critico] Canteiro A com umidade do solo < 20%             |
| [Aviso] Sensor do Canteiro C sem leitura valida            |
| [Info] Irrigacao do Canteiro B concluida                   |
+-------------------------------------------------------------+
| Acoes: [Ver canteiro] [Confirmar manutencao]               |
+-------------------------------------------------------------+
```

### WF-04 — Cadastro / Edicao de Canteiro (`FR-09`)

```text
+-------------------------------------------------------------+
| Cadastro de Canteiro                                        |
+-------------------------------------------------------------+
| Nome:        [____________________]                         |
| Localizacao: [____________________]                         |
| Cultura:     [____________________]                         |
| Sensor solo: [ vinculado ]                                  |
+-------------------------------------------------------------+
| [Salvar] [Cancelar]                                         |
+-------------------------------------------------------------+
```

---

## 9. Riscos e Mitigações

| Risco | Impacto | Mitigação arquitetural |
|:------|:--------|:-----------------------|
| Contrato divergente entre ESP32 e API | Alto | Padronizar payload JSON, validar schema e usar contract testing. |
| Persistência incorreta de leituras e irrigações | Alto | API separada, validação de entrada e banco relacional com integridade. |
| Dashboard quebrar com campo nulo ou dado desatualizado | Médio/Alto | Modelar fallback visual e estados de exceção já nos UCs. |
| Complexidade excessiva para o semestre | Alto | Preferir HTTP/REST e arquitetura simples em vez de broker e múltiplos serviços. |
| Falhas de integração só aparecerem tarde | Alto | Versionar RFC, SRS, UCs e estratégia de testes no mesmo repositório. |

---

## 10. Fora do Escopo / Próximos Passos

### Fora do escopo desta RFC MVP

- Operação definitiva em campo com observabilidade completa.
- Estratégia de deploy/produção final da API e do dashboard.
- Testes de carga pesados e tuning fino de banco.
- Aplicativo mobile ou notificações por múltiplos canais.

### Próximos passos

1. Implementar a API mínima com os endpoints ancorados nos UCs.
2. Versionar o dashboard no repositório para substituir os wireframes textuais por telas reais.
3. Ligar a RFC à estratégia de testes com suíte de contrato e smoke tests do Marco 3.
4. Refinar esta RFC no Marco 4 com evidências de integração ponta a ponta e ajustes pós-bancada.

