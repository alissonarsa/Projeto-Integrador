# Casos de Uso — Horta Inteligente

---

## UC-01: Coletar Leitura dos Sensores

**Ator Principal:** ESP32

**Pré-condições:** ESP32 ligado e conectado ao Wi-Fi. Sensores (DHT22, capacitivo de solo, LDR) conectados. API REST online.

**Fluxo Principal:**

1. O timer do ESP32 dispara a cada 5 minutos.
2. O ESP32 lê os sensores: temperatura, umidade do ar (DHT22), umidade do solo (capacitivo) e luminosidade (LDR).
3. O ESP32 monta o payload JSON (`canteiro_id`, `temperatura`, `umidade_ar`, `umidade_solo`, `luminosidade`, `timestamp`).
4. O ESP32 envia `POST /leituras` com header `X-API-Key`.
5. A API valida a chave e o payload, persiste no banco e retorna `201 Created`.
6. O ESP32 agenda a próxima leitura.

**Fluxos Alternativos:**

- **A1. Wi-Fi desconectado no passo 4:** o ESP32 detecta que está offline, armazena a leitura no buffer local (até 12 leituras) e tenta reconectar a cada 30 s por até 10 min. Ao reconectar, envia as leituras pendentes em sequência.

**Fluxos de Exceção:**

- **E1. Sensor retorna valor inválido no passo 2 (ex.: -999°C):** o valor está fora da faixa plausível. O ESP32 marca o campo como `null` no payload, registra `"ERRO: {sensor} leitura inválida"` no log serial e prossegue com os demais sensores.
- **E2. API key inválida no passo 5:** a API retorna `401 Unauthorized`. O ESP32 registra o erro no log e NÃO retenta. O LED onboard pisca 3 vezes.
- **E3. Timeout no passo 4 — API não responde em 10 s:** o ESP32 armazena a leitura no buffer local e retenta no próximo ciclo. Após 12 falhas, descarta as leituras mais antigas.
- **E4. API retorna 500 no passo 5:** ocorre erro interno no servidor. O tratamento DEVE ser o mesmo do timeout.
- **E5. Wi-Fi não reconecta após 10 min:** o ESP32 entra em modo offline, continua coletando no buffer e tenta reconectar a cada 5 min.

**Pós-condições:**

- *Sucesso:* leitura persistida no banco com todos os campos preenchidos.
- *Falha controlada:* leitura com campos nulos ou armazenada no buffer aguardando reenvio. O log serial contém o erro.

---

## UC-02: Acionar Irrigação Automática

**Ator Principal:** ESP32 (lógica automática)

**Pré-condições:** Leitura válida de umidade do solo e luminosidade recém-coletada. Relé conectado à bomba. Nenhuma irrigação ativa no canteiro.

**Fluxo Principal:**

1. Após a coleta de leitura, o ESP32 verifica: umidade do solo < 40% E luminosidade < 500 lux.
2. O ESP32 confirma que `irrigacao_ativa[canteiro_id]` é `false`.
3. Seta a flag como `true`, aciona o relé e liga a bomba.
4. Envia `POST /irrigacoes` com `canteiro_id`, `timestamp_inicio` e leituras de disparo. A API persiste com status `"em_andamento"`.
5. Após 60 s (configurável), desliga o relé.
6. Seta a flag como `false` e envia `PATCH /irrigacoes/{id}` com `timestamp_fim` e status `"concluida"`.

**Fluxos Alternativos:**

- **A1. Condições não atingidas no passo 1:** umidade ≥ 40% ou luminosidade ≥ 500 lux. Nenhuma ação é executada.
- **A2. Irrigação já ativa no passo 2:** a flag é `true`. O sistema registra no log e ignora a nova tentativa.

**Fluxos de Exceção:**

- **E1. Sensor de solo com falha no passo 1:** `umidade_solo` é `null`. O ESP32 NÃO irriga por precaução e registra `"AVISO: Irrigação suspensa — sensor de solo com falha"`.
- **E2. Relé não responde no passo 3:** o GPIO é acionado, mas não há mudança detectada. O sistema desativa o relé, reseta a flag e envia `POST /irrigacoes` com status `"falha_rele"`. O dashboard exibe: `"Bomba do canteiro {nome} não respondeu — verificar hardware"`.
- **E3. Sem conexão ao registrar no passo 4:** a API está inacessível. O sistema prossegue com a irrigação, porque a prioridade é irrigar, e armazena o evento no buffer.
- **E4. Reset do ESP32 durante irrigação no passo 5:** ocorre queda de energia ou reinicialização. O relé desliga (estado padrão: off). Um job na API marca irrigações `"em_andamento"` sem atualização há 5 min como `"interrompida"`.

**Pós-condições:**

- *Sucesso:* canteiro irrigado e evento registrado no banco com status `"concluida"`.
- *Falha controlada:* a irrigação não ocorreu ou foi interrompida. O motivo fica registrado no banco ou no log, e um alerta é exibido no dashboard.

---

## UC-03: Visualizar Status dos Canteiros

**Ator Principal:** Usuário da Comunidade (navegador web)

**Pré-condições:** Dashboard acessível. Banco com ao menos uma leitura. Usuário com acesso à rede.

**Fluxo Principal:**

1. O usuário acessa a URL do dashboard.
2. O dashboard requisita `GET /canteiros` e `GET /leituras/ultimas`.
3. O sistema renderiza um card por canteiro com: nome, temperatura, umidade do solo, umidade do ar, luminosidade, estado da irrigação e horário da última leitura.
4. O dashboard atualiza automaticamente a cada 30 s via polling.

**Fluxos Alternativos:**

- **A1. Acesso mobile no passo 3:** quando o viewport for < 768 px, os cards DEVEM ser empilhados em coluna única.
- **A2. Clique em canteiro no passo 3:** o usuário toca em um card e navega para a tela de detalhes com gráficos de 24 h e histórico de irrigações.

**Fluxos de Exceção:**

- **E1. API fora do ar na carga inicial no passo 2:** a requisição falha. O sistema exibe: `"Não foi possível conectar ao servidor."` com botão `"Tentar novamente"`.
- **E2. Polling falha durante uso no passo 4:** a atualização falha. O sistema mantém os últimos dados e exibe banner amarelo: `"Última atualização: {horário} — Sem conexão"`. Ao reconectar, o banner desaparece.
- **E3. Dados desatualizados há mais de 15 min no passo 3:** o card exibe indicador cinza: `"Sem dados recentes — última leitura há {X} min"`.
- **E4. Campo nulo por falha de sensor no passo 3:** o sistema exibe `"—"` no campo afetado e ícone de alerta: `"Sensor com falha — verificar conexão"`.
- **E5. Nenhum canteiro cadastrado no passo 2:** a lista retorna vazia. O sistema exibe: `"Nenhum canteiro cadastrado."`.

**Pós-condições:**

- *Sucesso:* o usuário visualiza o status atualizado dos canteiros.
- *Falha controlada:* os últimos dados continuam visíveis, com indicação clara de desatualização ou indisponibilidade.