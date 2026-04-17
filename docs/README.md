# Horta Inteligente

Sistema de monitoramento e irrigação automatizada para horta comunitária, integrando ESP32, sensores, API REST, banco de dados e dashboard web.

## Projeto Integrador — UNASP-EC

Repositório da disciplina de **Engenharia de Software** (Prof. Daniel) — Projeto Integrador do 5º período de Engenharia de Computação.

## Equipe

| Nome              | GitHub                                  |
|-------------------|-----------------------------------------|
| Leonardo Rossetti | [@leorfrr](https://github.com/leorfrr) |
| Alisson Silva     | [@alissonarsa](https://github.com/alissonarsa) |
| Luisa Felix       | TBD   D                                  |

## Tema

Sistema fisico-digital para coletar dados ambientais da horta, registrar leituras, acionar irrigacao automatica e exibir status e alertas para a comunidade.

## Escopo

- Coletar temperatura, umidade do ar, umidade do solo e luminosidade por canteiro.
- Enviar leituras do ESP32 para uma API REST via Wi-Fi.
- Registrar leituras e eventos de irrigacao no banco de dados.
- Exibir dashboard com status atual, graficos, alertas e historico.
- Gerar relatorios semanais de irrigacao e variaveis monitoradas.

## Visão Geral

Sensores (DHT22, capacitivo de solo, LDR) coletam dados ambientais de canteiros de uma horta comunitária. Um ESP32 processa as leituras, aciona a irrigação automaticamente e envia os dados via Wi-Fi para uma API REST. Os dados são persistidos em banco de dados e exibidos em um dashboard web.

```
Sensores → ESP32 → Wi-Fi → API REST → Banco de Dados → Dashboard Web
```

## Como rodar/verificar

Nesta fase do PI, o repositorio registra principalmente a **documentacao de engenharia**.

- Verificar o processo em `docs/process.md`
- Verificar as metricas em `docs/metrics.md`
- Verificar stakeholders, backlog, SRS e casos de uso em `docs/requirements/`
- Quando o firmware, a API e o dashboard forem versionados no repositorio, esta secao sera atualizada com instrucoes de execucao

## Documentação

- [Processo](process.md)
- [Plano de SCM](scm-plan.md)
- [Evidência de SCM](scm-evidence.md)
- [Métricas](metrics.md)
- [Stakeholders](requirements/stakeholders.md)
- [Backlog](requirements/backlog.md)
- [SRS](requirements/srs.md)
- [Casos de Uso](requirements/use-cases.md)