# Backlog do Produto - Horta Inteligente (v0.2)

Primeira versao priorizada do backlog do sistema de monitoramento da horta comunitaria, considerando restricoes reais de hardware, conectividade e operacao em campo.

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| FR-01 | O sistema DEVE coletar leituras de umidade do solo, temperatura, umidade do ar e luminosidade a cada 5 minutos via ESP32. | Must Have |
| FR-02 | O sistema DEVE enviar cada leitura para a API REST com `canteiro_id`, valores dos sensores e `timestamp`. | Must Have |
| FR-03 | O sistema DEVE registrar cada evento de irrigacao com inicio, fim, canteiro, leitura de disparo e status. | Must Have |
| FR-04 | O sistema DEVE acionar a irrigacao automaticamente quando `umidade_solo < 40%` e `luminosidade < 500 lux`. | Must Have |
| FR-05 | O sistema NAO DEVE acionar irrigacao quando ja houver irrigacao ativa no mesmo canteiro. | Must Have |
| FR-06 | O sistema NAO DEVE acionar irrigacao quando a leitura de umidade do solo estiver ausente ou invalida. | Must Have |
| FR-07 | O dashboard DEVE mostrar o status atual de cada canteiro, incluindo ultima leitura, horario e estado da irrigacao. | Must Have |
| FR-08 | O dashboard DEVE exibir graficos de temperatura, umidade do solo, umidade do ar e luminosidade por canteiro. | Must Have |
| FR-09 | O dashboard DEVE destacar alerta visual quando a umidade do solo for menor que 20% ou quando nao houver dados recentes por mais de 15 minutos. | Should Have |
| FR-10 | O sistema DEVE gerar relatorio semanal com total de irrigacoes e medias das variaveis por canteiro. | Should Have |
| FR-11 | O dashboard DEVE permitir cadastro e edicao de canteiros (nome, localizacao e cultura). | Could Have |
| FR-12 | O ESP32 DEVE manter buffer local de ate 12 leituras e reenviar os dados em ordem quando a conexao retornar. | Should Have |

## Requisitos Não-Funcionais

| ID | Requisito | Prioridade | Justificativa |
|----|-----------|------------|---------------|
| NFR-01 | A API DEVE responder a `POST /leituras` em <= 500 ms no percentil 95. | Must Have | O dashboard depende de dados quase em tempo real. |
| NFR-02 | O dashboard DEVE atingir LCP <= 3 s em conexao de 5 Mbps. | Must Have | A comunidade precisa conseguir consultar o sistema sem atraso excessivo. |
| NFR-03 | A comunicacao entre ESP32 e API DEVE usar HTTPS/TLS 1.2+ e autenticacao por API key. | Must Have | Evita envio de leituras falsas e interceptacao trivial do trafego. |
| NFR-04 | O ESP32 DEVE reconectar ao Wi-Fi automaticamente em ate 10 min apos queda de rede. | Should Have | O sistema opera em ambiente sujeito a instabilidade de conectividade. |
| NFR-05 | O sistema DEVE manter disponibilidade semanal de coleta >= 95%. | Should Have | O historico so tem valor se a coleta for frequente e consistente. |
| NFR-06 | O consumo do modulo ESP32 + sensores + rele, sem considerar a bomba, NAO DEVE exceder 350 mA em operacao normal. | Must Have | O dimensionamento eletrico do PI depende desse limite. |

## Restrições

| ID | Restrição |
|----|-----------|
| C-01 | O no de campo DEVE usar ESP32 DevKit, DHT22, sensor capacitivo de solo, LDR, modulo rele e mini bomba 5V, salvo aprovacao docente para substituicao. |
| C-02 | O sistema depende de conectividade Wi-Fi 2.4 GHz disponivel no local da horta para envio online das leituras. |
| C-03 | A instalacao em campo DEVE usar alimentacao 5V regulada, protecao eletrica e caixa hermetica definidas pelo modulo de Eletricidade Aplicada. |
| C-04 | O custo estimado dos componentes principais por grupo DEVE permanecer na faixa prevista pelo PI (aprox. R$ 180 a R$ 280), salvo justificativa aprovada. |

## Criterio de Aceitação completo - FR-03 (Must Have)

O requisito **FR-03 - Registrar evento de irrigacao** sera considerado pronto quando:

1. Dada uma leitura valida com `umidade_solo < 40%` e `luminosidade < 500 lux`, o ESP32 acionar a irrigacao e enviar o evento inicial para a API.
2. A API responder com sucesso e persistir no banco os campos `canteiro_id`, `timestamp_inicio`, `leitura_disparo` e `status = "em_andamento"`.
3. Ao finalizar o tempo configurado de irrigacao, o sistema atualizar o mesmo evento com `timestamp_fim` e `status = "concluida"`.
4. Em consulta ao banco, o registro retornado NAO possuir campos obrigatorios nulos.
5. Se o payload do evento estiver incompleto, a API retornar erro de validacao e NAO criar registro parcial.
6. O PR da funcionalidade anexar evidencia do teste (log serial, captura da API ou print da consulta no banco).
