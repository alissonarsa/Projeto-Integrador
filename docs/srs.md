# Especificação de Requisitos de Software (SRS) — Horta Inteligente

**Versão:** 1.0  
**Data:** 12/03/2026  
**Equipe:** Leonardo Rossetti, Alisson Aldenir, Luisa Felix

---

## 1. Requisitos Funcionais (FR)

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RF-01 | O sistema DEVE coletar leituras dos sensores de umidade do solo, temperatura ambiente, umidade do ar e luminosidade a cada 5 minutos por meio do ESP32. | **Must Have** | Dado o sistema em operação, quando decorridos 5 minutos desde a última leitura, o ESP32 DEVE realizar nova leitura e transmitir os dados via HTTP POST para a API REST; verificável consultando os timestamps no banco de dados e confirmando intervalo de 5 min (±10 s). |
| RF-02 | O sistema DEVE acionar automaticamente a irrigação (relé + bomba d'água) quando a umidade do solo for inferior a 40% E a luminosidade for inferior a 500 lux. | **Must Have** | Dado um canteiro com sensor de solo registrando < 40% de umidade e LDR registrando < 500 lux, o relé DEVE ser ativado em até 5 segundos; verificável com teste em bancada simulando solo seco e ambiente escuro e medindo o tempo de acionamento. |
| RF-03 | O sistema DEVE registrar cada evento de irrigação (timestamp de início, timestamp de fim, canteiro, leitura de umidade que disparou o evento) no banco de dados por meio da API REST. | **Must Have** | Dado que uma irrigação foi acionada, quando a bomba desligar, o sistema DEVE ter persistido um registro com os campos obrigatórios no banco; verificável executando `SELECT` na tabela de irrigações e confirmando que nenhum campo é nulo. |
| RF-04 | O dashboard web DEVE exibir gráficos de temperatura, umidade do solo, umidade do ar e luminosidade ao longo do tempo para cada canteiro. | **Must Have** | Dado o acesso ao dashboard, o usuário DEVE visualizar ao menos 4 gráficos (um por variável) com dados das últimas 24 horas; verificável acessando a página e confirmando que os gráficos renderizam com dados reais do banco. |
| RF-05 | O dashboard DEVE exibir o status atual de cada canteiro (última leitura de cada sensor e estado da irrigação: ligada/desligada). | **Must Have** | Dado o acesso ao dashboard, a tela principal DEVE mostrar para cada canteiro os valores mais recentes de umidade, temperatura, luminosidade e o estado da bomba; verificável comparando os valores exibidos com o último registro no banco. |
| RF-06 | O sistema DEVE disparar um alerta visual no dashboard quando a umidade do solo de qualquer canteiro atingir nível crítico (< 20%). | **Should Have** | Dado um canteiro com leitura de umidade do solo < 20%, o dashboard DEVE exibir um indicador visual de alerta (cor vermelha ou banner) em até 30 segundos após a leitura chegar ao banco; verificável inserindo um registro de teste com umidade 15% e observando o alerta. |
| RF-07 | O sistema DEVE gerar um relatório semanal com o consumo total de água (número de irrigações × duração média) e as médias das variáveis ambientais por canteiro. | **Should Have** | Dado que se passaram 7 dias, o sistema DEVE disponibilizar no dashboard um relatório com as métricas agregadas da semana; verificável acessando a aba de relatórios e conferindo que os valores correspondem à agregação manual dos registros do banco. |
| RF-08 | O dashboard DEVE permitir o cadastro e a edição de canteiros (nome, localização na horta, tipo de cultura plantada). | **Should Have** | Dado o acesso ao painel de administração, o usuário DEVE conseguir criar um novo canteiro e editar os dados de um canteiro existente, com persistência no banco; verificável criando um canteiro e verificando o registro via API GET. |
| RF-09 | O dashboard DEVE exibir um histórico de irrigações filtrado por canteiro e intervalo de datas. | **Could Have** | Dado o acesso à tela de histórico, o usuário DEVE conseguir selecionar um canteiro e um intervalo de datas e visualizar a lista de eventos de irrigação correspondentes; verificável aplicando o filtro e comparando com consulta direta ao banco. |
| RF-10 | O sistema NÃO DEVE acionar irrigação quando já existir um evento de irrigação em andamento no mesmo canteiro. | **Must Have** | Dado que a bomba de um canteiro já está ligada, se uma nova leitura satisfizer os limiares de irrigação, o sistema NÃO DEVE abrir um segundo acionamento; verificável simulando leituras consecutivas abaixo do limiar e confirmando apenas um registro de irrigação ativo. |

---

## 2. Requisitos Não-Funcionais (NFR) — FURPS+

### 2.1 Funcionalidade (Segurança)

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-01 | Toda comunicação entre o ESP32 e a API REST DEVE utilizar HTTPS/TLS 1.2 ou superior. | **Must Have** | Captura de tráfego com Wireshark entre ESP32 e servidor DEVE mostrar pacotes TLS; requisições HTTP puro DEVEM ser rejeitadas pela API com status 403. |
| RNF-02 | A API REST DEVE validar a origem das requisições por meio de uma chave de autenticação (API key) exclusiva por ESP32. | **Must Have** | Requisição POST /leituras sem header `X-API-Key` válido DEVE retornar status 401; verificável via Postman enviando requisição sem a chave. |

### 2.2 Usabilidade

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-03 | O dashboard DEVE ser responsivo e utilizável em telas de 360 px (mobile) até 1920 px (desktop). | **Must Have** | Teste em Chrome DevTools com viewports de 360 px, 768 px e 1920 px DEVE renderizar todos os elementos sem scroll horizontal e sem sobreposição de componentes. |
| RNF-04 | Um usuário da comunidade sem experiência técnica DEVE ser capaz de interpretar o status dos canteiros no dashboard em menos de 30 segundos após breve capacitação. | **Should Have** | Teste de usabilidade com 3 participantes da comunidade: ao menos 2 de 3 DEVEM identificar corretamente qual canteiro precisa de atenção em ≤ 30 s. |

### 2.3 Confiabilidade (Reliability)

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-05 | O sistema DEVE manter disponibilidade de coleta de dados de pelo menos 95% ao longo de uma semana de operação contínua (permitindo no máximo 8,4 h de downtime semanal). | **Must Have** | Log do banco DEVE conter registros de leitura em pelo menos 95% dos intervalos de 5 minutos esperados em 7 dias (≥ 1.910 de 2.016 leituras); verificável via query `COUNT`. |
| RNF-06 | O ESP32 DEVE reconectar automaticamente à rede Wi-Fi em caso de desconexão, com tentativa de reconexão a cada 30 segundos por até 10 minutos. | **Should Have** | Teste de desconexão forçada do Wi-Fi: o ESP32 DEVE restabelecer a conexão e retomar o envio de dados em até 10 minutos; verificável observando os logs serial e os timestamps no banco. |
| RNF-07 | O ESP32 DEVE armazenar em buffer local até 60 minutos de leituras em caso de falha de conectividade e enviá-las quando a conexão for restaurada. | **Should Have** | Após desconectar o Wi-Fi por 30 minutos e reconectar, o banco DEVE receber as leituras acumuladas em até 60 segundos após a reconexão; verificável comparando timestamps das leituras com o período de offline. |

### 2.4 Performance

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-08 | A API REST DEVE responder a requisições POST /leituras em no máximo 500 ms no percentil 95 (p95). | **Must Have** | Teste de carga com 100 requisições sequenciais via ferramenta de benchmark (ex.: `ab` ou `k6`): 95% das respostas DEVEM ter latência ≤ 500 ms. |
| RNF-09 | O dashboard DEVE carregar a tela principal (com dados dos canteiros) em no máximo 3 segundos em uma conexão de 5 Mbps. | **Must Have** | Teste com Chrome Lighthouse em throttling de 5 Mbps: métrica LCP (Largest Contentful Paint) DEVE ser ≤ 3 000 ms. |
| RNF-10 | O dashboard DEVE atualizar os dados exibidos em no máximo 30 segundos após uma nova leitura ser persistida no banco. | **Should Have** | Inserção manual de leitura no banco: o dashboard DEVE refletir o novo valor em ≤ 30 s sem refresh manual; verificável cronometrando o tempo entre o INSERT e a atualização visual. |

### 2.5 Suportabilidade

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-11 | O código-fonte do dashboard DEVE seguir um padrão de lint configurado (ESLint) com 0 erros no CI. | **Must Have** | Pipeline de CI DEVE executar `eslint .` e falhar o build se houver qualquer erro; verificável no log da última execução do CI. |
| RNF-12 | O sistema DEVE possuir documentação técnica (manual de manutenção) que permita a um técnico substituir um sensor ou ESP32 defeituoso sem conhecimento prévio do projeto. | **Should Have** | Teste com voluntário técnico externo: DEVE ser capaz de seguir o manual e realizar a substituição de um sensor em até 30 minutos. |

### 2.6 Restrições Físicas (+)

| ID | Descrição | Prioridade | Critério de Aceitação |
|:---|:----------|:-----------|:----------------------|
| RNF-13 | O consumo elétrico total do módulo de sensoriamento (ESP32 + sensores + relé) NÃO DEVE exceder 350 mA em operação contínua. | **Must Have** | Medição com multímetro em modo de operação normal DEVE registrar corrente ≤ 350 mA; verificável no relatório de testes elétricos (disciplina EA). |
| RNF-14 | O sistema de alimentação (painel solar + bateria) DEVE garantir autonomia mínima de 12 horas sem incidência solar. | **Should Have** | Teste de autonomia: desconectar o painel solar e medir o tempo até o sistema parar; DEVE ser ≥ 12 h; verificável no relatório de testes elétricos. |
| RNF-15 | Todos os componentes eletrônicos instalados na horta DEVEM estar protegidos em caixa hermética com classificação mínima IP54. | **Must Have** | Inspeção visual e consulta da especificação da caixa utilizada DEVE confirmar classificação ≥ IP54. |
| RNF-16 | O sistema DEVE operar corretamente com sinal Wi-Fi de no mínimo -70 dBm no ponto de instalação dos sensores. | **Should Have** | Medição de intensidade de sinal no local de instalação DEVE ser ≥ -70 dBm; teste de envio de dados DEVE ter taxa de sucesso ≥ 95% nessa condição. |
