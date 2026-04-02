# Backlog do Produto — Horta Inteligente

Requisitos do módulo de Engenharia de Software do sistema de monitoramento da horta comunitária.

## Requisitos Funcionais

| Requisito | Prioridade |
|:----------|:-----------|
| O sistema DEVE coletar leituras de umidade do solo, temperatura, umidade do ar e luminosidade a cada 5 minutos via ESP32. | **Must Have** |
| O sistema DEVE acionar a irrigação automaticamente quando umidade do solo < 40% e luminosidade < 500 lux. | **Must Have** |
| O sistema DEVE registrar cada evento de irrigação (timestamps, canteiro, leitura que disparou) no banco de dados. | **Must Have** |
| O dashboard DEVE exibir gráficos de temperatura, umidade do solo, umidade do ar e luminosidade por canteiro. | **Must Have** |
| O dashboard DEVE mostrar o status atual de cada canteiro (última leitura e estado da irrigação). | **Must Have** |
| O sistema NÃO DEVE acionar irrigação quando já houver uma irrigação em andamento no mesmo canteiro. | **Must Have** |
| O dashboard DEVE disparar alerta visual quando a umidade do solo de um canteiro for < 20%. | **Should Have** |
| O sistema DEVE gerar relatório semanal com total de irrigações e médias das variáveis por canteiro. | **Should Have** |
| O dashboard DEVE permitir cadastro e edição de canteiros (nome, localização, cultura). | **Could Have** |

## Requisitos Não-Funcionais

| Requisito | Prioridade |
|:----------|:-----------|
| A comunicação ESP32 ↔ API DEVE usar HTTPS/TLS 1.2+. | **Must Have** |
| A API DEVE responder a POST /leituras em ≤ 500 ms (p95). | **Must Have** |
| O dashboard DEVE carregar em ≤ 3 s em conexão de 5 Mbps. | **Must Have** |
| O dashboard DEVE ser responsivo (360 px a 1920 px). | **Must Have** |
| O consumo elétrico total do módulo de sensoriamento NÃO DEVE exceder 350 mA. | **Must Have** |
| O sistema DEVE manter ≥ 95% de disponibilidade de coleta semanal. | **Should Have** |
| O ESP32 DEVE reconectar ao Wi-Fi automaticamente em até 10 minutos após queda. | **Should Have** |

## Restrições

| Restrição |
|:----------|
| Dashboard web acessível via navegadores modernos (Chrome, Safari, Edge). |
| Banco de dados: MySQL, PostgreSQL ou Firebase (a definir com Prof. Rodrigo). |
| Stack do dashboard: React ou Vue + Node.js ou Flask (a definir). |
| Hardware fixo: ESP32, DHT22, sensor capacitivo de solo, LDR, relé, mini bomba 5V. |
