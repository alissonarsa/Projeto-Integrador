# Horta Inteligente

Sistema de monitoramento e irrigação automatizada para horta comunitária.

## Projeto Integrador — Engenharia de Software

Repositório destinado às entregas da disciplina de **Engenharia de Software** (Prof. Daniel) dentro do Projeto Integrador do 5º período de Engenharia de Computação — UNASP-EC.

## Equipe

| Nome              | GitHub                                              |
|-------------------|-----------------------------------------------------|
| Leonardo Rossetti | [@leorfrr](https://github.com/leorfrr)             |
| Alisson Aldenir   | TBD                                                 |
| Luisa Felix       | TBD                                                 |

## Visão Geral do Sistema

O sistema monitora variáveis ambientais de uma horta comunitária (temperatura, umidade do solo, luminosidade) por meio de sensores conectados a um ESP32. Os dados são transmitidos via Wi-Fi para uma API REST, persistidos em banco de dados e exibidos em um dashboard web em tempo real. A irrigação é acionada automaticamente com base em regras de limiar.

**Fluxo técnico:**

```
Sensores (DHT22, capacitivo de solo, LDR)
  → ESP32
    → Wi-Fi
      → API REST
        → Banco de Dados
          → Dashboard Web
```

## Estrutura da Documentação

- [Processo](process.md)
- [Métricas](metrics.md)
- [Stakeholders](requirements/stakeholders.md)
- [SRS — Especificação de Requisitos](requirements/srs.md)
