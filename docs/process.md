# Processo

## Ciclo

O time opera em sprints de 1 semana. Na segunda-feira ocorre o planning (15 a 20 min) para selecionar itens do backlog alinhados ao marco atual do PI. Na sexta-feira ocorre review + retrospectiva (20 min) com demonstracao do que foi concluido, problemas encontrados e proximos ajustes.

## Cerimônias

- **Planning (~15 min):** selecionar itens do backlog para a sprint, alinhado ao marco atual do PI.
- **Review + Retro (~20 min):** demonstrar o que foi feito, levantar o que melhorar.

## Definition of Ready (DoR)

1. Existe issue com descricao clara do problema ou entrega.
2. O item possui criterio de aceitacao testavel.
3. Dependencias conhecidas foram registradas (hardware, endpoint, banco ou tela).
4. O tamanho foi estimado em P, M ou G.

## Definition of Done (DoD)

1. O criterio de aceitacao do item foi atendido.
2. Ha evidencia no PR (print, log serial, captura da API, foto de bancada ou video curto).
3. O PR recebeu pelo menos 1 review aprovado por outro membro.
4. Lint, teste e documentacao foram atualizados quando aplicavel.
5. Quando a mudanca afetar integracao, o fluxo parcial impactado foi revalidado (ex.: ESP32 -> API -> Banco).

## PR e Review

- Branch por feature, fix ou docs (`feat/...`, `fix/...`, `docs/...`).
- Autor nao faz merge do proprio PR.
- Review em ate 48 h.
- Mudancas que alterem payload, contrato de API, limiar de irrigacao ou estrutura de banco devem citar o artefato afetado no PR.
