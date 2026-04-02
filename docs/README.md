# Horta Inteligente

Sistema de monitoramento e irrigação automatizada para horta comunitária.

## Projeto Integrador — UNASP-EC

Repositório da disciplina de **Engenharia de Software** (Prof. Daniel) — Projeto Integrador do 5º período de Engenharia de Computação.

## Equipe

| Nome              | GitHub                                  |
|-------------------|-----------------------------------------|
| Leonardo Rossetti | [@leorfrr](https://github.com/leorfrr) |
| Alisson Aldenir   | TBD                                     |
| Luisa Felix       | TBD                                     |

## Visão Geral

Sensores (DHT22, capacitivo de solo, LDR) coletam dados ambientais de canteiros de uma horta comunitária. Um ESP32 processa as leituras, aciona a irrigação automaticamente e envia os dados via Wi-Fi para uma API REST. Os dados são persistidos em banco de dados e exibidos em um dashboard web.

```
Sensores → ESP32 → Wi-Fi → API REST → Banco de Dados → Dashboard Web
```

## Documentação

- [Processo](process.md)
- [Métricas](metrics.md)
- [Stakeholders](requirements/stakeholders.md)
- [Backlog](requirements/backlog.md)
- [SRS](requirements/srs.md)