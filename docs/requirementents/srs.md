# SRS — Especificação de Requisitos de Software

**Projeto:** Horta Inteligente  
**Versão:** 1.0  
**Equipe:** Leonardo Rossetti, Alisson Aldenir, Luisa Felix

---

## 1. Requisitos Funcionais

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RF-01 | O sistema DEVE coletar leituras dos sensores (umidade do solo, temperatura, umidade do ar, luminosidade) a cada 5 minutos via ESP32. | Must Have | Timestamps consecutivos no banco DEVEM ter intervalo de 5 min (±10 s). |
| RF-02 | O sistema DEVE acionar a irrigação quando umidade do solo < 40% E luminosidade < 500 lux. | Must Have | Em teste de bancada com solo seco e ambiente escuro, o relé DEVE ativar em até 5 s. |
| RF-03 | O sistema DEVE registrar cada evento de irrigação (início, fim, canteiro, leitura de disparo) no banco. | Must Have | Após irrigação, `SELECT` na tabela DEVE retornar registro completo sem campos nulos. |
| RF-04 | O dashboard DEVE exibir gráficos de temperatura, umidade do solo, umidade do ar e luminosidade por canteiro. | Must Have | Ao acessar o dashboard, 4 gráficos com dados das últimas 24 h DEVEM estar visíveis. |
| RF-05 | O dashboard DEVE mostrar o status atual de cada canteiro (última leitura + estado da irrigação). | Must Have | Valores exibidos DEVEM corresponder ao último registro no banco. |
| RF-06 | O sistema NÃO DEVE acionar irrigação quando já houver irrigação ativa no mesmo canteiro. | Must Have | Leituras consecutivas abaixo do limiar DEVEM gerar apenas 1 registro de irrigação ativo. |
| RF-07 | O dashboard DEVE exibir alerta visual quando umidade do solo < 20%. | Should Have | Registro de teste com umidade 15% DEVE gerar indicador vermelho em até 30 s. |
| RF-08 | O sistema DEVE gerar relatório semanal com total de irrigações e médias por canteiro. | Should Have | Após 7 dias, aba de relatórios DEVE exibir métricas correspondentes aos dados do banco. |
| RF-09 | O dashboard DEVE permitir cadastro e edição de canteiros (nome, localização, cultura). | Could Have | Criar canteiro no painel e confirmar persistência via GET na API. |

---

## 2. Requisitos Não-Funcionais (FURPS+)

| ID | Categoria | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:----------|:-----------|:----------------------|
| RNF-01 | Segurança | Comunicação ESP32 ↔ API DEVE usar HTTPS/TLS 1.2+. | Must Have | Wireshark DEVE mostrar pacotes TLS; HTTP puro DEVE retornar 403. |
| RNF-02 | Segurança | A API DEVE validar requisições com API key por ESP32. | Must Have | POST sem header `X-API-Key` válido DEVE retornar 401. |
| RNF-03 | Performance | A API DEVE responder POST /leituras em ≤ 500 ms (p95). | Must Have | Teste com 100 requisições: 95% com latência ≤ 500 ms. |
| RNF-04 | Performance | O dashboard DEVE carregar em ≤ 3 s (LCP) em conexão de 5 Mbps. | Must Have | Lighthouse com throttling 5 Mbps: LCP ≤ 3 000 ms. |
| RNF-05 | Usabilidade | O dashboard DEVE ser responsivo de 360 px a 1920 px. | Must Have | Chrome DevTools em 360, 768 e 1920 px sem scroll horizontal. |
| RNF-06 | Confiabilidade | O sistema DEVE manter ≥ 95% de disponibilidade de coleta semanal. | Should Have | ≥ 1.910 de 2.016 leituras esperadas em 7 dias. |
| RNF-07 | Confiabilidade | O ESP32 DEVE reconectar ao Wi-Fi em até 10 min após desconexão. | Should Have | Desconexão forçada: envio de dados retomado em ≤ 10 min. |
| RNF-08 | Restrição Física | Consumo do módulo (ESP32 + sensores + relé) NÃO DEVE exceder 350 mA. | Must Have | Medição com multímetro ≤ 350 mA em operação normal. |
| RNF-09 | Restrição Física | Componentes na horta DEVEM estar em caixa hermética ≥ IP54. | Must Have | Verificação da especificação da caixa utilizada. |