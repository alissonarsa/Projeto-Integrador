# Estratégia de Testes — Horta Inteligente

## 1.1 Cabeçalho

| Campo | Valor |
|:------|:------|
| Equipe | Leonardo Rossetti, Alisson Silva e Luisa Felix |
| Versão | v0.1 |
| Data | 2026-05-10 |
| RFC de referência | [`docs/rfc/rfc-001-arquitetura-mvp.md`](rfc/rfc-001-arquitetura-mvp.md) |
| Marco associado | Marco 3 do PI |

## 1.2 Escopo desta estratégia

### O que esta v0.1 cobre

- **UC-01 (Coletar Leitura dos Sensores)**, com foco na fronteira **ESP32 → API** e no contrato público do endpoint `POST /leituras`, sem confundir o contrato-alvo da equipe com o stub simplificado usado em aula.
- **UC-02 (Acionar Irrigação Automática)** no recorte que já permite decidir testes agora: regra de não acionar duas vezes o mesmo fluxo sem controle de estado e contrato mínimo de registro de irrigação.
- **UC-03 (Visualizar Status dos Canteiros)** apenas no que depende diretamente do formato dos dados devolvidos pela API, sobretudo campos nulos, leituras ausentes e ordenação temporal.
- Os componentes priorizados nesta v0.1 são os que concentram o maior risco do Marco 3: **API**, **contratos HTTP/JSON**, integração futura com **ESP32** e consumo desses dados pelo **dashboard**.
- A evidência executável mínima desta versão usa **teste de contrato contra a API de referência da aula**, porque a API própria da equipe ainda não está versionada no repositório.

### O que fica fora desta v0.1 e entra na v0.2

- **Teste em hardware real** (sensor, relé, bomba e Wi-Fi instável) fica para a v0.2, quando a equipe estiver no Marco 4 e puder validar comportamento com bancada e campo.
- **Testes de aceitação do dashboard completo**, incluindo alertas visuais, gráficos e responsividade, ficam para a v0.2 porque o frontend ainda não está versionado neste repositório.
- **Carga e performance com volume alto de dados reais** (por exemplo, centenas de milhares de leituras) ficam para a v0.2, quando a API e o banco próprios já estiverem rodando em conjunto.
- **Resiliência de rede e chaos/resiliência IoT** ficam fora desta v0.1 porque o maior risco atual não é falha bizarra de rede, e sim desencontro de contrato entre consumidor e provider.
- **Segurança aplicada** (auth real, tokens, hardening e SAST/SCA) não entra como foco principal desta estratégia v0.1 porque será aprofundada na sequência da disciplina em DevSecOps.

## 1.3 Matriz risco → teste

| UC | Risco técnico concreto | Nível de teste | Justificativa |
|:---|:-----------------------|:---------------|:--------------|
| UC-01 | O contrato de `POST /leituras` divergir entre consumidor e provider em campos obrigatórios, tipos ou status code, fazendo a integração quebrar mesmo com cada lado “funcionando sozinho”. | integration | O risco mora na fronteira consumer-provider; unit test isolado não detecta quebra de contrato HTTP/JSON. |
| UC-01 | Payload inválido em `POST /leituras` deixar de retornar `422` com chave `detail`, quebrando o tratamento de erro do consumidor. | integration | O formato de erro é contrato público da API e só aparece exercitando a rota real. |
| UC-02 | O sistema aceitar dois acionamentos seguidos da mesma zona sem respeitar janela de bloqueio/estado ativo, gerando irrigação duplicada. | integration | O risco está na semântica do endpoint e do estado compartilhado, não em lógica puramente local. |
| UC-02 | A regra “não irrigar com leitura inválida/nula” ser implementada de forma incorreta na função de decisão do firmware ou backend. | unit | Aqui o risco é lógica determinística de decisão; um teste unitário barato pega o erro sem montar infraestrutura. |
| UC-03 | O dashboard quebrar ao receber da API leitura com campo nulo ou ausência de dados recentes, em vez de exibir fallback visual controlado. | acceptance | O defeito é percebido pela ótica do usuário final; unit test de componente não prova o comportamento completo da tela. |
| UC-03 | A listagem de leituras retornar ordenação errada ou filtro incorreto, exibindo dado antigo como se fosse o mais recente. | integration | O risco mora na camada de dados/consulta e no contrato do endpoint, não na UI isolada. |

## 1.4 Níveis de teste aplicados ao projeto

**Unit.** Neste projeto, unit test só entra onde há lógica pura e barata de manter. O melhor exemplo é a regra que decide se deve irrigar ou bloquear irrigação quando `umidade_solo` vem nula, fora da faixa ou abaixo do limiar. Esse tipo de regra pode ser testado em função isolada do firmware ou do backend sem banco, sem rede e sem dashboard. A equipe não escolhe unit como nível dominante porque a maior parte do risco da horta não mora em algoritmo puro, e sim nas fronteiras entre componentes.

**Integration.** Este é o nível prioritário da v0.1. O valor do sistema está em **ESP32 ↔ API ↔ dados consumidos pelo dashboard**, então o teste mais útil agora é o que valida contrato e comportamento de endpoints reais. O exemplo concreto desta estratégia é o teste de contrato do endpoint `POST /leituras`, que verifica `201 Created`, schema da resposta e presença de campo obrigatório. Também é o nível escolhido para o risco de acionamento duplicado em irrigação e para filtros/ordenação de leituras.

**System.** System test só faz sentido quando a pilha completa estiver minimamente rodando: firmware enviando dados, API gravando, banco persistindo e dashboard lendo. Como o repositório atual ainda não contém esses módulos integrados, a equipe decide **não usar system test como evidência principal da v0.1**. Ele entra como próximo passo do Marco 3 para smoke tests de fluxo ponta a ponta e ganha força total na v0.2/Marco 4.

**Acceptance.** Acceptance test será usado para provar comportamento visível ao usuário, especialmente no dashboard: exibir fallback para sensor com falha, indicador de dados desatualizados e atualização correta da visão do canteiro. A equipe **não automatiza acceptance nesta v0.1** porque o frontend ainda não está implementado no repositório. Mesmo assim, o nível já aparece na matriz para registrar a decisão: quando a UI existir, esses riscos não serão rebaixados para unit por conveniência.

## 1.5 Técnica “moderna por contexto” escolhida — ADR

### ADR-TST-001 — Contract testing para a fronteira ESP32 ↔ API

**Contexto.** O maior risco técnico do Release 1 não é um cálculo complexo, e sim o desencontro de contrato entre quem consome e quem provê a API. O ESP32 e o dashboard dependem do formato público dos endpoints (`status code`, campos obrigatórios, enums e erros em `detail`). Se a API mudar silenciosamente esse formato, cada lado pode “funcionar sozinho” e ainda assim quebrar na integração.

**Decisão.** A equipe adota **contract testing com `pytest` + `requests` + `jsonschema`** para congelar o contrato público dos endpoints HTTP. Nesta v0.1, a aplicação concreta é o endpoint `POST /leituras`: o teste valida `201 Created`, schema de saída, enum do sensor e presença de campo obrigatório. O mesmo padrão será repetido para `GET /leituras` e `POST /irrigacao` quando a API própria estiver no repositório.

**Alternativas rejeitadas.**
- **Só unit test na camada da rota:** rejeitado porque mocka rede e serialização, escondendo exatamente o bug que mais dói neste projeto: API e consumidor divergirem no formato.
- **Só E2E/system test ponta a ponta:** rejeitado porque é mais caro, falha “por tudo” e ainda não cabe no estado atual do repositório, onde a pilha completa não está versionada.
- **Pact ou broker de contratos completo:** rejeitado nesta fase porque a equipe é pequena, o custo operacional é alto para o semestre e `jsonschema` já cobre o risco dominante do Release 1.

**Consequências.** Ganhamos detecção precoce de quebras de contrato, rastreabilidade clara entre UC e endpoint e uma suíte barata de rodar em PR. Pagamos o custo de manter schemas versionados e atualizar explicitamente o teste quando o contrato público mudar por decisão legítima.

**Quando não usar.** Esta decisão deixa de ser a técnica central se o projeto virar um monólito único sem fronteiras HTTP relevantes, ou se a equipe migrar para um cenário em que o maior risco passe a ser resiliência/disponibilidade em produção. Nesse caso, contract testing continua útil, mas deixa de ser a técnica “moderna por contexto” dominante.

## 1.6 Estratégia de regressão

Quando alguém abre um PR novo, a política desta equipe passa a ter **duas camadas de regressão**. A primeira é o check já existente de SCM (`ci / placeholder`), que continua como guarda mínima da branch `main`, conforme a A1.5. A segunda é a suíte de contrato em `tests/contract`, executada no workflow `contract-tests.yml`, que sobe a API de referência da aula localmente e roda `pytest tests/contract -v` com alvo de execução **até 2 minutos** por PR. Para PRs que tocam contrato, documentação de teste, endpoint ou integração, essa suíte deve ficar verde antes do merge.

No estado atual do repositório, o **status check tecnicamente obrigatório no GitHub** ainda é o `ci / placeholder`; por isso, a equipe declara aqui a política complementar: **nenhum revisor aprova PR de API/contrato com `contract-tests` falhando**, mesmo antes de o owner atualizar a branch protection para tornar esse workflow obrigatório também. **Bloqueiam merge por política da equipe:** `ci / placeholder`, revisão aprovada e `contract-tests` verde para mudanças em API/contrato/testes. **Só alertam ou ficam manuais nesta v0.1:** smoke/system test ponta a ponta e acceptance do dashboard, executados em release/bancada. A equipe descobre regressão por três sinais: falha da suíte de contrato, divergência entre schema versionado e resposta real, e evidência manual anexada ao PR para fluxos ainda não automatizados. **Regra de ouro:** todo bug novo que escapar e for corrigido deve virar teste permanente na suíte apropriada.

## 1.7 Evidência executável

- Arquivo de teste principal: [`../tests/contract/test_api_leituras_contract.py`](../tests/contract/test_api_leituras_contract.py)
- Schemas congelados do contrato:
  - [`../tests/contract/schemas/leitura_out.schema.json`](../tests/contract/schemas/leitura_out.schema.json)
  - [`../tests/contract/schemas/error_422.schema.json`](../tests/contract/schemas/error_422.schema.json)
- Evidência de execução: [`test-strategy/evidencias/pytest-contract-api-ref-2026-05-10.txt`](test-strategy/evidencias/pytest-contract-api-ref-2026-05-10.txt)
- Workflow para regressão automática em PR: [`../.github/workflows/contract-tests.yml`](../.github/workflows/contract-tests.yml)

**Âncora explícita na matriz:**
- `test_post_leitura_honra_contrato` protege a **1ª linha da matriz (UC-01 / quebra de contrato em `POST /leituras`)**.
- `test_post_leitura_sem_timestamp_retorna_422_detail` protege a **2ª linha da matriz (UC-01 / payload inválido deve retornar `422` com `detail`)**.

**Teste mínimo entregue nesta v0.1:** contrato real de `POST /leituras`, validando `status code`, schema da resposta e campo obrigatório, além de caminho de erro `422` com `detail`, executado contra a **API de referência da aula**. Essa evidência prova a técnica e o fluxo de regressão; o contrato-alvo definitivo da equipe continua sendo o descrito na RFC e nos UCs.

## 1.8 Próximos passos (v0.2)

- Migrar a suíte de contrato do stub da aula para a **API própria da equipe** assim que o backend estiver versionado no repositório.
- Adicionar teste de integração para `POST /irrigacao` cobrindo semântica de `ja_em_execucao` e TTL.
- Criar smoke/system test do fluxo **sensor → API → banco → dashboard** para o Marco 4.
- Automatizar acceptance test do dashboard para os cenários de dados nulos, dados desatualizados e estado de irrigação.
- Incluir performance check simples para listagem de leituras e primeiros testes de segurança/erro a partir da aula de DevSecOps.
