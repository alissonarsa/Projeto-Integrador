# Mapeamento de Stakeholders — Horta Inteligente

## 1. Usuários Diretos

- **Membros da comunidade / pequenos produtores:** utilizam o dashboard para acompanhar o estado dos canteiros (umidade, temperatura, luminosidade) e o histórico de irrigações. Participam da oficina de capacitação.
- **Responsável operacional da horta:** pessoa designada pela comunidade para monitorar alertas, verificar o funcionamento diário do sistema e acionar manutenção quando necessário.

## 2. Técnicos e Mantenedores

- **Equipe de hardware (Líder de Hardware / Eletricista):** responsáveis pela montagem, alimentação elétrica, instalação dos sensores e manutenção física do sistema (ESP32, painel solar, caixa hermética).
- **DBA / Analista de Dados:** responsável pela modelagem do banco, API REST e integridade dos dados persistidos.
- **Desenvolvedor Web (Eng. de Software):** responsável pelo dashboard, sistema de alertas, relatórios e manual do usuário.

## 3. Agentes Indiretos / Entorno

- **Coordenação do Projeto Integrador (Profa. Lilian):** coordena o alinhamento entre as 4 disciplinas e valida os marcos de entrega.
- **Professores das disciplinas (Prof. Abraão, Prof. Rodrigo, Prof. Daniel):** orientam e avaliam os módulos de suas respectivas áreas.
- **UNASP-EC (instituição):** fornece infraestrutura acadêmica e articula a parceria de extensão com a comunidade.
- **Comunidade do entorno:** beneficiária direta do projeto de extensão; recebe a cartilha de automação e participa das oficinas.

## 4. Segurança

- **Atacante (threat actor):** agente mal-intencionado que pode tentar interceptar dados do sistema via rede Wi-Fi ou manipular a API REST para enviar leituras falsas ou acionar irrigação indevida.

## 5. Reguladores e Normas

- **LGPD / ANPD:** caso o sistema armazene dados pessoais dos usuários da comunidade (nome, e-mail), a Lei Geral de Proteção de Dados se aplica.
- **Normas elétricas (NR-10 / NBR 5410):** aplicáveis ao dimensionamento e instalação elétrica do painel solar e alimentação do sistema.
