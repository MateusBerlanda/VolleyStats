# VolleyStats

Site de estatísticas da **Superliga Feminina e Masculina 2026/27**: calendário, classificação, ranking de atletas e elencos, com um painel de administrador para lançar as jogadas de cada partida pelo celular.

Feito com HTML, CSS e JavaScript puros (sem frameworks e sem backend).

## O que funciona hoje

**Site público (`index.html`)**
- Abas Superliga Feminina / Masculina.
- Calendário completo (turno e returno) com carrossel de rodadas (setas para anterior e próxima).
- Classificação calculada a partir dos jogos finalizados (3-0 e 3-1 dão 3 pontos; 3-2 dá 2 ao vencedor e 1 ao perdedor; desempate por pontos, vitórias e quociente de sets).
- Ranking dos maiores pontuadores (total, ataque, bloqueio, saque ou erros), com filtro por time.
- Elenco de cada time.

**Painel admin (`admin.html`)**
- Escolha da rodada e do jogo.
- Lançamento de jogadas por atleta (ataque, bloqueio, saque e erro) com um toque.
- Placar calculado automaticamente a partir das jogadas: ataque, bloqueio e saque somam para o time da atleta; erro soma para o adversário.
- Sets 1 a 4 vão a 25 pontos e o 5º a 15, sempre com 2 pontos de diferença. Vence quem fizer 3 sets.
- Histórico de jogadas, com opção de excluir uma jogada ou desfazer a última (o placar é recalculado).
- Botão para finalizar a partida, que registra o resultado e atualiza a classificação.
- Edição dos dados de cada atleta (número, nome, posição e foto).
- Exportar e importar backup em JSON.

## Como os dados são guardados

- O **elenco-base** e o **calendário** ficam no código (`js/atletas.js` e `js/teams.js`).
- As **jogadas**, os **resultados** e as **edições de atletas** ficam no `localStorage` do navegador onde o admin foi usado.
- Para o site público mostrar os resultados, exporte o backup no admin (ele gera o arquivo `dados.json`) e suba esse arquivo na raiz do repositório, ao lado do `index.html`. O site lê o `dados.json` automaticamente.

## Limitações

- Os dados lançados no celular **não aparecem sozinhos** para quem visita o site. Só aparecem depois que o `dados.json` é publicado. Não existe placar ao vivo para o público.
- Não há login: o `admin.html` é uma página comum, apenas com `noindex`. Qualquer pessoa que souber o endereço consegue abri-la, mas o que ela lançar fica só no navegador dela.
- O elenco **não está completo**: o feminino está cadastrado para os 12 times, mas o masculino está incompleto. Números de camisa não confirmados aparecem como "—". Confira tudo nas fichas oficiais de cada clube e da CBV antes de usar em partidas reais.
- Não existe integração com dados oficiais da CBV.

## Executar localmente

1. Abra a pasta no VS Code.
2. Inicie um servidor estático (por exemplo, a extensão Live Server) e abra `index.html`.
3. Também funciona com `python -m http.server 8000` na pasta do projeto, acessando `http://localhost:8000`.

Evite abrir o arquivo direto pelo disco (`file://`), porque o navegador bloqueia a leitura do `dados.json`.

## Publicar no GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Source**, escolha a branch principal e a pasta raiz.
3. Depois de salvar, o site fica disponível no endereço mostrado pelo GitHub.

## Estrutura

- `index.html`: site público.
- `admin.html`: painel de lançamento de jogadas.
- `css/style.css`: estilos do site (o admin também usa).
- `css/admin.css`: estilos específicos do painel.
- `js/teams.js`: times e calendário completo da temporada.
- `js/atletas.js`: elencos, tipos de estatística, posições e funções compartilhadas (leitura/gravação, totais, rodadas).
- `js/app.js`: lógica do site público.
- `js/admin.js`: lógica do painel.
- `img/`: logos dos times e do site.

## Próximas etapas

1. Completar o elenco masculino e os números de camisa.
2. Para o público ver o placar ao vivo: guardar os dados num banco (Supabase) em vez do `localStorage`.
3. Proteger o painel com login de administrador.
4. Importar dados oficiais, somente se a fonte for autorizada, ou usar importação manual com revisão.
5. Testes e revisão de acessibilidade.

## Fontes do elenco

CBV (lista de clubes da Superliga 2026/27), O Tempo (elencos femininos 2026/27), Gerdau/Minas Tênis Clube (elenco feminino do Minas) e Minas Tênis Clube (elenco masculino do Itambé Minas).
