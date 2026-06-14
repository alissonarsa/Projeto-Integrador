Para gerar os dados, rodem o script incluído nesta atividade:

python3 gerar-dados-sinteticos.py --seed 42
Isso cria a pasta dados-sinteticos/ com os seguintes CSVs:

Arquivo	Registros	O que contém
usuarios.csv	3	Usuários do sistema (admin, operador, visualizador)
canteiros.csv	4	Canteiros A–D com diferentes culturas
culturas.csv	4	Tipo de planta de cada canteiro
sensores.csv	12	3 sensores por canteiro (DHT22, capacitivo, LDR)
leituras.csv	207.360	Leituras a cada 5 min, Jan–Jun 2026
irrigacoes.csv	~570	Eventos de irrigação automática
seed.sql	—	INSERTs dos cadastros + instruções de import
Os dados incluem: ciclo dia/noite de temperatura, sazonalidade (verão quente, inverno frio), umidade do ar correlacionada com temperatura, luminosidade com curva solar e dias nublados, umidade do solo com decaimento e reposição por irrigação, e irrigações automáticas quando umidade_solo < 40% e luminosidade < 500 lux.

Consultem como-usar-dados-sinteticos.md para instruções de importação (MySQL, PostgreSQL, Firebase).

Usem estes dados como base do dashboard. Podem complementar com cenários de borda (sensor offline, leitura suspeita, etc.) conforme necessário.