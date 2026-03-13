# Processo

## Ciclo

Scrum com sprints de 1 semana, alinhado aos marcos do Projeto Integrador (M1–M5). Planning na segunda-feira, review + retro na sexta-feira.

## Cerimônias

- **Planning (~15 min):** selecionar itens do backlog da sprint com base no marco atual do PI.
- **Review + Retro (~20 min):** demonstrar o que foi feito na semana, validar critérios de aceite e levantar pontos de melhoria.

## Alinhamento Inter-Disciplinas

Reunião rápida de sincronização com os demais módulos (Sistemas Digitais, Eletricidade Aplicada, Banco de Dados) quando houver dependência cruzada — especialmente nas semanas de integração (S9, S12–S14).

## Definition of Ready (DoR)

1. Issue com descrição clara e critérios de aceite definidos
2. Sem dependência bloqueante de outro módulo (ou dependência já resolvida)
3. Tamanho estimado (P, M, G)

## Definition of Done (DoD)

1. Código funcionando localmente
2. PR com pelo menos 1 review aprovado por outro membro da equipe
3. CI verde (lint + testes, quando aplicável)
4. Documentação atualizada se a mudança impactar o SRS ou a arquitetura

## PR e Review

- Branch por feature/fix (`feat/xxx`, `fix/xxx`)
- PRs revisadas por outro membro da equipe; autor não faz o próprio merge
- Review em até 48 h

## Entregas por Marco (Formato RFC — Prof. Daniel)

| Marco | Semana | Entrega esperada |
|-------|--------|------------------|
| M1    | S3     | RFC Inicial — escopo, plano de trabalho, requisitos levantados |
| M2    | S6     | RFC Finalizado — arquitetura, wireframes validados, testes planejados |
| M3    | S11    | Partes independentes funcionais — dashboard v1, alertas, relatórios |
| M4    | S14    | Sistema integrado — dashboard com dados reais, testes de usabilidade |
| M5    | S16    | Documentação final — RFC consolidado, manual do usuário, relatório de extensão |
