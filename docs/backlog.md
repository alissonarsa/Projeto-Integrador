# Backlog do Produto — Horta Inteligente (v0.1)

Requisitos do módulo de Engenharia de Software do sistema de monitoramento da horta comunitária.

## 1. Requisitos Funcionais (FR)

| ID | Requisito | Prioridade |
|:---|:----------|:-----------|
| RF-01 | O sistema DEVE coletar leituras de umidade do solo, temperatura, umidade do ar e luminosidade a cada 5 minutos via ESP32. | **Must Have** |
| RF-02 | O sistema DEVE acionar a irrigação automaticamente quando umidade do solo < 40% e luminosidade < 500 lux. | **Must Have** |
| RF-03 | O sistema DEVE registrar cada evento de irrigação (timestamps, canteiro, leitura que disparou) no banco de dados. | **Must Have** |
| RF-04 | O dashboard DEVE exibir gráficos de temperatura, umidade do solo, umidade do ar e luminosidade por canteiro. | **Must Have** |
| RF-05 | O dashboard DEVE mostrar o status atual de cada canteiro (última leitura e estado da irrigação). | **Must Have** |
| RF-06 | O sistema NÃO DEVE acionar irrigação quando já houver uma irrigação em andamento no mesmo canteiro. | **Must Have** |
| RF-07 | O dashboard DEVE disparar alerta visual quando a umidade do solo de um canteiro for < 20%. | **Should Have** |
| RF-08 | O sistema DEVE gerar relatório semanal com total de irrigações e médias das variáveis por canteiro. | **Should Have** |
| RF-09 | O dashboard DEVE permitir cadastro e edição de canteiros (nome, localização, cultura). | **Could Have** |

## 2. Requisitos Não-Funcionais (NFR)

| ID | Requisito | Prioridade |
|:---|:----------|:-----------|
| RNF-01 | A comunicação ESP32 ↔ API DEVE usar HTTPS/TLS 1.2+. | **Must Have** |
| RNF-02 | A API DEVE responder a POST /leituras em ≤ 500 ms (p95). | **Must Have** |
| RNF-03 | O dashboard DEVE carregar em ≤ 3 s em conexão de 5 Mbps. | **Must Have** |
| RNF-04 | O dashboard DEVE ser responsivo (360 px a 1920 px). | **Must Have** |
| RNF-05 | O consumo elétrico total do módulo de sensoriamento NÃO DEVE exceder 350 mA. | **Must Have** |
| RNF-06 | O sistema DEVE manter ≥ 95% de disponibilidade de coleta semanal. | **Should Have** |
| RNF-07 | O ESP32 DEVE reconectar ao Wi-Fi automaticamente em até 10 minutos após queda. | **Should Have** |

## 3. Restrições

| ID | Restrição |
|:---|:----------|
| C-01 | Dashboard web acessível via navegadores modernos (Chrome, Safari, Edge). |
| C-02 | Banco de dados: MySQL, PostgreSQL ou Firebase (a definir com Prof. Rodrigo). |
| C-03 | Stack do dashboard: React ou Vue + Node.js ou Flask (a definir). |
| C-04 | Hardware fixo: ESP32, DHT22, sensor capacitivo de solo, LDR, relé, mini bomba 5V. |