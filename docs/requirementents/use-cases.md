# Casos de Uso — Horta Inteligente

---

## Coletar Leitura dos Sensores

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

- **Wi-Fi desconectado:** No passo 4, o ESP32 detecta que está offline. Armazena a leitura no buffer local (até 12 leituras) e tenta reconectar a cada 30 s por até 10 min. Ao reconectar, envia as leituras pendentes em sequência.

**Fluxos de Exceção:**

- **Sensor retorna valor inválido (ex: -999°C):** No passo 2, o valor está fora da faixa plausível. O ESP32 marca o campo como `null` no payload, registra `"ERRO: {sensor} leitura inválida"` no log serial e prossegue com os demais sensores.
- **API key inválida:** No passo 5, a API retorna `401 Unauthorized`. O ESP32 registra o erro no log e NÃO retenta. LED onboard pisca 3 vezes.
- **Timeout — API não responde em 10 s:** No passo 4, sem resposta. O ESP32 armazena no buffer local e retenta no próximo ciclo. Após 12 falhas, descarta leituras mais antigas.
- **API retorna 500:** No passo 5, erro interno. Mesmo tratamento do timeout.
- **Wi-Fi não reconecta após 10 min:** O ESP32 entra em modo offline: continua coletando no buffer e tenta reconectar a cada 5 min.

**Pós-condições:**

- *Sucesso:* Leitura persistida no banco com todos os campos preenchidos.
- *Falha controlada:* Leitura com campos nulos ou armazenada no buffer aguardando reenvio. Log serial contém o erro.

---

## Acionar Irrigação Automática

**Ator Principal:** ESP32 (lógica automática)

**Pré-condições:** Leitura válida de umidade do solo e luminosidade recém-coletada. Relé conectado à bomba. Nenhuma irrigação ativa no canteiro.

**Fluxo Principal:**

1. Após a coleta de leitura, o ESP32 verifica: umidade do solo < 40% E luminosidade < 500 lux.
2. O ESP32 confirma que `irrigacao_ativa[canteiro_id]` é `false`.
3. Seta a flag como `true`, aciona o relé e liga a bomba.
4. Envia `POST /irrigacoes` com `canteiro_id`, `timestamp_inicio` e leituras de disparo. API persiste com status `"em_andamento"`.
5. Após 60 s (configurável), desliga o relé.
6. Seta a flag como `false` e envia `PATCH /irrigacoes/{id}` com `timestamp_fim` e status `"concluida"`.

**Fluxos Alternativos:**

- **Condições não atingidas:** No passo 1, umidade ≥ 40% ou luminosidade ≥ 500 lux. Nenhuma ação.
- **Irrigação já ativa:** No passo 2, flag é `true`. Registra no log e ignora.

**Fluxos de Exceção:**

- **Sensor de solo com falha:** No passo 1, `umidade_solo` é `null`. O ESP32 NÃO irriga por precaução. Registra `"AVISO: Irrigação suspensa — sensor de solo com falha"`.
- **Relé não responde:** No passo 3, GPIO acionado mas sem mudança detectada. Desativa o relé, reseta a flag e envia `POST /irrigacoes` com status `"falha_rele"`. Dashboard exibe: `"Bomba do canteiro {nome} não respondeu — verificar hardware"`.
- **Sem conexão ao registrar:** No passo 4, API inacessível. Prossegue com a irrigação (prioridade é irrigar) e armazena o evento no buffer.
- **Reset do ESP32 durante irrigação:** No passo 5, queda de energia. Relé desliga (estado padrão: off). Job na API marca irrigações `"em_andamento"` sem update há 5 min como `"interrompida"`.

**Pós-condições:**

- *Sucesso:* Canteiro irrigado, evento registrado no banco com status `"concluida"`.
- *Falha controlada:* Irrigação não ocorreu ou foi interrompida. Motivo registrado no banco/log e alerta exibido no dashboard.

---

## Visualizar Status dos Canteiros

**Ator Principal:** Usuário da Comunidade (navegador web)

**Pré-condições:** Dashboard acessível. Banco com ao menos uma leitura. Usuário com acesso à rede.

**Fluxo Principal:**

1. O usuário acessa a URL do dashboard.
2. O dashboard requisita `GET /canteiros` e `GET /leituras/ultimas`.
3. Renderiza um card por canteiro com: nome, temperatura, umidade do solo, umidade do ar, luminosidade, estado da irrigação e horário da última leitura.
4. Atualiza automaticamente a cada 30 s via polling.

**Fluxos Alternativos:**

- **Acesso mobile:** No passo 3, viewport < 768 px. Cards empilhados em coluna única.
- **Clique em canteiro:** Usuário toca em um card. Navega para detalhes com gráficos 24 h e histórico de irrigações.

**Fluxos de Exceção:**

- **API fora do ar na carga inicial:** No passo 2, requisição falha. Exibe: `"Não foi possível conectar ao servidor."` com botão `"Tentar novamente"`.
- **Polling falha durante uso:** No passo 4, atualização falha. Mantém últimos dados e exibe banner amarelo: `"Última atualização: {horário} — Sem conexão"`. Ao reconectar, banner desaparece.
- **Dados desatualizados > 15 min:** No passo 3, card exibe indicador cinza: `"Sem dados recentes — última leitura há {X} min"`.
- **Campo nulo — sensor com falha:** No passo 3, exibe `"—"` no campo e ícone de alerta: `"Sensor com falha — verificar conexão"`.
- **Nenhum canteiro cadastrado:** No passo 2, lista vazia. Exibe: `"Nenhum canteiro cadastrado."`.

**Pós-condições:**

- *Sucesso:* Usuário visualiza status atualizado (dados de no máximo 30 s).
- *Falha controlada:* Últimos dados exibidos com indicação clara de desatualização ou indisponibilidade.
