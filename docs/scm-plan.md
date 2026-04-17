# Plano de SCM

Este documento explica como o repositório da Horta Inteligente é gerenciado no dia a dia: como nascem branches, como um PR chega em `main`, como escrevemos commits e quem faz o quê. Ele complementa o `process.md`, que cuida do ciclo de sprint.

## 1.1 Política de Branching

O time adota **GitHub Flow**: só existe uma branch longa, a `main`, e todo trabalho acontece em branches curtas que saem dela e voltam via Pull Request.

Por que GitHub Flow e não os outros:

- **Somos 3 pessoas com sprint de 1 semana** (ver `process.md`). GitFlow foi pensado para times grandes com ciclos de release longos e branches de hotfix — cerimônia demais para o nosso tamanho.
- **Ainda não temos CI rodando testes de verdade** (no início do projeto o repo é majoritariamente documentação). Trunk-based só funciona bem com CI forte, então ficaria arriscado.
- GitHub Flow casa naturalmente com os marcos do PI: cada entregável vira uma ou mais branches de feature, mergeadas em `main` quando prontas.

**Padrões de nome de branch:**

- `feat/<escopo>` — nova funcionalidade (ex.: `feat/endpoint-leituras`)
- `fix/<bug>` — correção (ex.: `fix/sensor-solo-null`)
- `docs/<escopo>` — só documentação (ex.: `docs/adr-postgres`)
- `chore/<escopo>` — manutenção sem impacto funcional (ex.: `chore/pr-template`)

O `<escopo>` é curto, em kebab-case, e descreve o que muda — não o nome de quem escreveu.

**Quem pode mergear em `main`:** qualquer membro do time, desde que o PR tenha 1 aprovação de alguém que não seja o autor e o CI esteja verde. Autor nunca mergeia o próprio PR.

## 1.2 Proteção da branch `main`

Estas regras estão (ou serão) configuradas em **GitHub Settings → Branches → Branch protection rules** para `main`:

- **Pull Request obrigatório** — push direto em `main` bloqueado.
- **Mínimo de 1 aprovação**, de alguém que não seja o autor. Com 3 pessoas, exigir 2 aprovações trava o fluxo se alguém faltar; 1 aprovação + autor já garante dois pares de olhos no código.
- **Status check obrigatório:** `ci / placeholder` (o workflow em `.github/workflows/ci.yml`). O check tem que estar verde para o botão de merge liberar.
- **Dismiss stale approvals** quando novos commits forem empurrados — se o PR muda depois da aprovação, alguém revisa de novo.
- **Require linear history** — sem merge commits tortos no histórico.
- **Bloquear force-push e deleção** de `main`.
- **Conversations resolvidas** — nenhum comentário de review pendente na hora do merge.

## 1.3 Convenção de Commits

Seguimos [Conventional Commits 1.0.0 (PT-BR)](https://www.conventionalcommits.org/pt-br/v1.0.0/).

Tipos aceitos no projeto:

- `feat` — nova funcionalidade
- `fix` — correção de bug
- `docs` — só documentação
- `chore` — manutenção sem impacto funcional
- `refactor` — muda código sem mudar comportamento
- `test` — adiciona ou ajusta testes
- `ci` — muda configuração de CI/build

Três exemplos de como commits reais deste projeto devem ficar:

```
feat(firmware): envia leituras do DHT22 para /leituras via HTTP POST
fix(api): trata leitura com umidade_solo null sem derrubar o endpoint
docs(srs): atualiza RF-07 para incluir alerta de umidade crítica
```

O escopo entre parênteses é opcional, mas ajuda muito a saber se o commit mexe em `firmware`, `api`, `dashboard`, `srs`, `backlog`, etc.

## 1.4 Definição de "Pronto" para um PR

Este checklist estende a [Definition of Done do `process.md`](process.md#definition-of-done-dod) — lá é o que define um item de sprint como entregue; aqui é o que define um PR como mergeável.

Todo PR precisa ter, antes do merge:

- [ ] **Descrição explica o porquê**, não só o quê. Um revisor externo consegue entender a motivação sem abrir o código.
- [ ] **Linka o item relacionado** do backlog, issue ou caso de uso (ex.: "fecha UC-03" ou "parte do marco 3").
- [ ] **Pelo menos 1 aprovação** de alguém que não seja o autor, sem conversas pendentes.
- [ ] **Documentação atualizada** quando a mudança afeta SRS, casos de uso, README ou manual. Se não se aplica, o PR diz isso explicitamente.
- [ ] **Evidência anexada** quando a mudança é funcional — print do dashboard, log do monitor serial, resposta do Postman, foto da bancada, ou vídeo curto.
- [ ] **CI verde** (status check `ci / placeholder`).

## 1.5 Papéis

Com time de 3 pessoas, preferimos responsabilidade coletiva a donos fixos:

- **Revisão de PRs:** todos. Qualquer membro pode (e deve) revisar qualquer PR. SLA de 48h, herdado do `process.md`.
- **Merge em `main`:** qualquer membro, desde que não seja o autor do PR e que as regras de proteção (1.2) estejam satisfeitas.
- **Manutenção do CI:** responsabilidade do time inteiro. Quem quebra o CI, conserta. O Gerente de Projeto da semana (papel rotativo, ver documentação do PI) fica de olho para garantir que ninguém ignore um check vermelho.
