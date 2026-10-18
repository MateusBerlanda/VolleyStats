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

Os dados ficam no **Supabase** (banco de dados na nuvem), em 3 tabelas: `atletas`, `jogadas` e `jogos`.

- O **calendário** e os **times** ficam no código (`js/teams.js`). O **elenco-base** também está no código (`js/atletas.js`) e foi enviado ao banco pelo botão "Enviar elenco ao Supabase" do admin.
- **Admin:** cada toque, exclusão de jogada, partida finalizada ou edição de atleta aparece na hora na tela e entra numa fila local, que é enviada ao Supabase em seguida. Sem internet, a fila espera e é enviada quando a conexão volta. O painel mostra se está tudo sincronizado.
- **Site público:** lê as 3 tabelas do Supabase ao abrir a página. Se o Supabase estiver fora do ar, usa o `dados.json` (exportado pelo admin) como plano B.
- **Segurança:** todo mundo pode **ler** as tabelas, mas só o usuário administrador logado pode **gravar** (regras RLS do Supabase). O cadastro de novos usuários está desligado. A chave publishable que está em `js/supabase.js` é pública por natureza. A chave **secret** nunca vai para o código.

## Limitações

- O site público ainda **não atualiza sozinho**: quem está com a página aberta vê os dados do momento em que abriu e precisa recarregar. O placar ao vivo é a próxima etapa.
- O site baixa **todas** as jogadas para montar o ranking. Com poucos jogos isso é rápido, mas com a temporada inteira o ideal é o banco calcular os totais (uma "view" no Supabase).
- O `admin.html` é uma página comum, só com `noindex`. Qualquer pessoa que souber o endereço consegue abri-la, mas sem o login do administrador o banco recusa qualquer gravação.
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
- `js/supabase.js`: conexão com o Supabase (login, fila de envio, leitura paginada).
- `js/dados-publicos.js`: faz o site público ler do Supabase (com o `dados.json` como plano B).
- `js/app.js`: lógica do site público.
- `js/admin.js`: lógica do painel.
- `img/`: logos dos times e do site.

## Próximas etapas

1. Completar o elenco masculino e os números de camisa.
2. Placar ao vivo: o site público receber cada jogada na hora (Supabase Realtime, já ativado nas tabelas).
3. Calcular os totais do ranking no próprio banco (view), para o site carregar menos dados.
4. Importar dados oficiais, somente se a fonte for autorizada, ou usar importação manual com revisão.
5. Testes e revisão de acessibilidade.

## Fontes do elenco

CBV (lista de clubes da Superliga 2026/27), O Tempo (elencos femininos 2026/27), Gerdau/Minas Tênis Clube (elenco feminino do Minas) e Minas Tênis Clube (elenco masculino do Itambé Minas).
