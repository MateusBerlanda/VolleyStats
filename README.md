# VolleyStats

Plataforma demonstrativa para consultar e analisar estatísticas de voleibol, com foco na Superliga Feminina e Masculina.

## O que funciona nesta versão

- Interface responsiva para desktop e celular.
- Seletor de competição e temporada demonstrativa.
- Tabela de classificação com siglas e explicações em títulos de colunas.
- Filtros de jogos: todos, próximos e resultados.
- Modal com detalhes de partidas e placares por set demonstrativos.
- Ranking de atletas com busca.
- Painel de registro de ações com atualização do placar, histórico e desfazer.
- Funções puras para cálculos estatísticos.
- Schema inicial PostgreSQL/Supabase com RLS.

## Limitações importantes

**Esta versão ainda não é uma plataforma de produção.** Não existe conexão ativa com Supabase nem uma fonte oficial CBV configurada. A interface usa dados simulados e exibe avisos. O registro ao vivo funciona apenas na sessão atual do navegador e não é compartilhado nem persistido em banco. O painel não deve ser usado para estatísticas oficiais até implementar autenticação, persistência, validação das regras de pontuação e testes.

## Executar localmente

1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. Inicie um servidor estático (por exemplo, a extensão Live Server) e abra `index.html`.
4. Também é possível usar `python -m http.server 8000` na pasta do projeto e acessar `http://localhost:8000`.

Evite abrir o arquivo por `file://` caso o navegador restrinja recursos locais.

## Configurar Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/migrations/001_initial_schema.sql`.
3. Revise o schema, as políticas RLS e os requisitos de autorização para seu caso antes de colocar dados reais.
4. Configure autenticação por e-mail no Supabase Auth.
5. Crie o primeiro usuário administrador por um procedimento seguro. **Não permita que usuários comuns alterem sua própria função.** Faça a promoção inicial por SQL no painel seguro ou por uma função administrativa protegida.
6. Ao conectar o frontend, use somente a URL do projeto e a chave `anon`/publishable. Nunca coloque `service_role` no navegador.
7. Crie uma camada de serviço para consultar dados publicados e enviar eventos autenticados. A aplicação deve mostrar “salvo” somente após confirmação do banco.

O schema é um ponto de partida e precisa de testes de segurança antes de produção. A função de papel e as políticas devem ser revisadas, especialmente para a publicação e alteração de dados.

## Dados oficiais

Não existe integração oficial implementada neste pacote. Antes de importar dados da CBV, confirme a disponibilidade, documentação e autorização da fonte. Registre a origem, a data de atualização e a identificação externa de cada registro. Se não houver API documentada/autorizada, use importação manual ou assistida e revisão antes de publicar.

## Estrutura

- `index.html`: interface principal.
- `css/`: estilos globais, componentes, tabelas e responsividade.
- `js/app.js`: renderização e interações da demonstração.
- `js/services/statistics.js`: cálculos estatísticos.
- `supabase/migrations/`: schema SQL e políticas iniciais.
- `supabase/seed.sql`: cadastros opcionais de demonstração.
- `tests/`: testes básicos de cálculo.

## Próximas etapas recomendadas

1. Conectar leitura pública ao Supabase.
2. Criar login de administrador e gerenciamento seguro de funções.
3. Implementar cadastro de competições, equipes, atletas e partidas.
4. Persistir eventos com transações/idempotência e trilha de auditoria.
5. Formalizar critérios de pontuação e encerramento conforme regulamento da temporada.
6. Adicionar integração autorizada e conciliação com dados oficiais.
7. Executar testes funcionais, de integridade, RLS e acessibilidade.


## Alterações desta versão (2026/27)

- Adicionado um elenco-base fixo em `js/atletas.js`; os dados salvos localmente são mesclados pelo identificador para preservar ajustes existentes.
- O painel administrativo calcula um placar em pontos a partir das jogadas: ataque, bloqueio e saque vencedores somam para o time da atleta; uma jogada marcada como erro soma para o adversário.
- O placar é recalculado a partir do histórico, portanto a ação “Desfazer última jogada” também corrige o placar.
- **Atenção:** o elenco incluído nesta edição contém apenas atletas que consegui confirmar nas informações públicas consultadas, não todos os atletas inscritos nos 24 clubes. Números de camisa não confirmados aparecem como “—”. A lista completa com números e posições precisa ser validada a partir das fichas oficiais de cada clube/CBV antes de considerar o cadastro completo.
- O placar calculado é a soma de pontos registrados no jogo; ainda não há separação de pontos por set, rotação, saque atual ou encerramento automático de set.

Fonte pública usada para confirmar equipes e parte dos nomes: CBV, lançamento da Superliga 2026/2027 — https://cbv.com.br/noticias/volei-de-quadra/2026-10-01/cbv-lanca-superliga-2026-2027-na-cob-expo-em-sao-paulo


## Elencos da Superliga 2026/2027

Os elencos femininos publicados em `js/atletas.js` foram organizados por equipe e posição, usando informações públicas da temporada 2026/27. Os números das camisas não foram preenchidos quando não estavam confirmados. A lista masculina ainda está incompleta e deve ser complementada com as relações oficiais de cada clube antes de ser considerada um cadastro completo das 24 equipes.

Fontes de referência: CBV (lista de clubes da Superliga 2026/27), O Tempo (elencos femininos 2026/27), Gerdau/Minas Tênis Clube (elenco feminino do Minas) e Minas Tênis Clube (elenco masculino do Itambé Minas).
