# Métricas

Estas metricas acompanham **fluxo** e **qualidade** do time. Elas sao usadas para diagnostico e melhoria do processo, nunca para punicao individual. A coleta ocorre na review de sexta-feira.

| ID | Metrica | Tipo | Definicao | Meta inicial | Como coletar |
|----|---------|------|-----------|--------------|--------------|
| M-01 | Lead Time de PR | Fluxo | Tempo entre a abertura do PR e o merge em `main`. | Mediana <= 5 dias uteis | Historico do GitHub (`merged_at - created_at`) |
| M-02 | Tempo ate o primeiro review | Fluxo | Tempo entre a abertura do PR e o primeiro review submetido por outro membro. | <= 48 h | Historico do GitHub (`first_review_at - created_at`) |
| M-03 | Taxa de falha em mudancas | Qualidade | Percentual de PRs mergeados que geraram bug, regressao ou hotfix em ate 72 h. | <= 20% | Relacao entre PRs mergeados e issues/PRs de correcao vinculados |
| M-04 | Taxa de sucesso do fluxo integrado parcial | Qualidade / Integracao | Percentual de testes aprovados no fluxo Sensor -> ESP32 -> Wi-Fi -> API -> Banco. | >= 80% a partir da primeira bancada integrada | Registro de testes do time com data, resultado e evidencia |

## Observacoes de coleta

- Enquanto o hardware ainda nao estiver integrado, a metrica M-04 fica registrada como **N/A**, e nao como zero.
- As metas serao recalibradas apos as duas primeiras sprints, quando houver historico real do time.
- Toda regressao registrada na M-03 deve apontar qual PR originou a mudanca e qual criterio de aceitacao falhou.