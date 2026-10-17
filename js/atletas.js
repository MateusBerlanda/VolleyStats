"use strict";
// Código compartilhado entre o site (app.js) e o painel (admin.js).
// Precisa ser carregado DEPOIS do teams.js e ANTES do app.js / admin.js.

// Chaves do localStorage
const K_ATLETAS = "volleyStats_atletas";   // { id, categoria, idTime, nome, numero, posicao, foto }
const K_JOGADAS = "volleyStats_jogadas";   // 1 item por toque: { id, idJogo, idAtleta, tipo, ts }
const K_JOGOS = "volleyStats_jogos";       // placares (gravado pelo app.js)

// Tipos de estatística. Para criar um novo, basta adicionar uma linha.
const STATS = [
    { chave: "ataque", rotulo: "Ataque", tipo: "ponto" },
    { chave: "bloqueio", rotulo: "Bloqueio", tipo: "ponto" },
    { chave: "saque", rotulo: "Saque", tipo: "ponto" },
    { chave: "erro", rotulo: "Erro", tipo: "erro" }
];

// Posições em quadra (F = feminino, M = masculino)
const POSICOES = [
    { chave: "levantador", F: "Levantadora", M: "Levantador" },
    { chave: "oposto", F: "Oposta", M: "Oposto" },
    { chave: "ponteiro", F: "Ponteira", M: "Ponteiro" },
    { chave: "central", F: "Central", M: "Central" },
    { chave: "libero", F: "Líbero", M: "Líbero" }
];
const rotuloPosicao = (chave, cat) => {
    const p = POSICOES.find((x) => x.chave === chave);
    return p ? p[cat] : "Sem posição";
};
const semAcento = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// "ponteira", "Ponteiro", "pon" → "ponteiro"
function acharPosicao(texto) {
    const t = semAcento(texto || "").trim().slice(0, 3);
    const p = t && POSICOES.find((x) => semAcento(x.F).startsWith(t));
    return p ? p.chave : "";
}

// Silhueta usada quando a atleta não tem foto
const AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#dfe5ef"/>' +
    '<circle cx="32" cy="25" r="12" fill="#9aa8bf"/><path d="M8 64c2-16 14-22 24-22s22 6 24 22z" fill="#9aa8bf"/></svg>');
const fotoDe = (atleta) => atleta.foto || AVATAR;

// Utilidades
const $ = (id) => document.getElementById(id);
// Escapa texto antes de usar em innerHTML (evita injeção de HTML)
const esc = (t) => String(t).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Dados publicados no GitHub (dados.json). Só o site público (app.js) preenche isto;
// o painel admin continua usando apenas o localStorage do próprio navegador.
const DADOS_PUBLICOS = {};

// Elenco-base embutido no código. Números/posições ficam nulos quando não há
// confirmação suficiente na fonte consultada; não inventar dados de camisa.
// A lista oficial completa deve ser atualizada clube a clube quando publicada.
// Elencos organizados por modalidade e equipe. Edite os atletas dentro de cada equipe.
// Formato de cada atleta: { id, categoria, idTime, nome, numero, posicao, foto }.
const ELENCOS_SUPERLIGA = {
    F: { // Superliga Feminina
        1: [ // Batavo Mackenzie
            { id: "F-1-rose", categoria: "F", idTime: 1, nome: 'Rose', numero: null, posicao: "levantador", foto: "" },
            { id: "F-1-lyara", categoria: "F", idTime: 1, nome: 'Lyara', numero: null, posicao: "levantador", foto: "" },
            { id: "F-1-julia-eduarda", categoria: "F", idTime: 1, nome: 'Júlia Eduarda', numero: null, posicao: "levantador", foto: "" },
            { id: "F-1-maeva-orle", categoria: "F", idTime: 1, nome: 'Maëva Orlé', numero: null, posicao: "oposto", foto: "" },
            { id: "F-1-arianne", categoria: "F", idTime: 1, nome: 'Arianne', numero: null, posicao: "oposto", foto: "" },
            { id: "F-1-clarinha", categoria: "F", idTime: 1, nome: 'Clarinha', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-geovanna", categoria: "F", idTime: 1, nome: 'Geovanna', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-roberta", categoria: "F", idTime: 1, nome: 'Roberta', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-paula-mohr", categoria: "F", idTime: 1, nome: 'Paula Mohr', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-malu", categoria: "F", idTime: 1, nome: 'Malu', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-gabi-leticia", categoria: "F", idTime: 1, nome: 'Gabi Letícia', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-1-kelly", categoria: "F", idTime: 1, nome: 'Kelly', numero: null, posicao: "central", foto: "" },
            { id: "F-1-saraelen", categoria: "F", idTime: 1, nome: 'Saraelen', numero: null, posicao: "central", foto: "" },
            { id: "F-1-jocelyn-urias", categoria: "F", idTime: 1, nome: 'Jocelyn Urias', numero: null, posicao: "central", foto: "" },
            { id: "F-1-lia-rosa", categoria: "F", idTime: 1, nome: 'Lia Rosa', numero: null, posicao: "central", foto: "" },
            { id: "F-1-aline", categoria: "F", idTime: 1, nome: 'Aline', numero: null, posicao: "central", foto: "" },
            { id: "F-1-paulina", categoria: "F", idTime: 1, nome: 'Paulina', numero: null, posicao: "libero", foto: "" },
        ],
        2: [ // Brasília Vôlei/BRB
            { id: "F-2-ana-paula", categoria: "F", idTime: 2, nome: 'Ana Paula', numero: null, posicao: "levantador", foto: "" },
            { id: "F-2-clara", categoria: "F", idTime: 2, nome: 'Clara', numero: null, posicao: "levantador", foto: "" },
            { id: "F-2-gabi-carneiro", categoria: "F", idTime: 2, nome: 'Gabi Carneiro', numero: null, posicao: "oposto", foto: "" },
            { id: "F-2-karen", categoria: "F", idTime: 2, nome: 'Karen', numero: null, posicao: "oposto", foto: "" },
            { id: "F-2-manu", categoria: "F", idTime: 2, nome: 'Manu', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-2-milca", categoria: "F", idTime: 2, nome: 'Milca', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-2-beatriz", categoria: "F", idTime: 2, nome: 'Beatriz', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-2-thay", categoria: "F", idTime: 2, nome: 'Thay', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-2-aline", categoria: "F", idTime: 2, nome: 'Aline', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-2-fran-jacintho", categoria: "F", idTime: 2, nome: 'Fran Jacintho', numero: null, posicao: "central", foto: "" },
            { id: "F-2-dayana-martinez", categoria: "F", idTime: 2, nome: 'Dayana Martínez', numero: null, posicao: "central", foto: "" },
            { id: "F-2-vivi-goes", categoria: "F", idTime: 2, nome: 'Vivi Goes', numero: null, posicao: "central", foto: "" },
            { id: "F-2-ana-sauer", categoria: "F", idTime: 2, nome: 'Ana Sauer', numero: null, posicao: "libero", foto: "" },
            { id: "F-2-vitoria", categoria: "F", idTime: 2, nome: 'Vitória', numero: null, posicao: "libero", foto: "" },
        ],
        3: [ // Brusque Vôlei
            { id: "F-3-isis-simonetti", categoria: "F", idTime: 3, nome: 'Ísis Simonetti', numero: 2, posicao: "levantador", foto: "" },
            { id: "F-3-thais-oliveira", categoria: "F", idTime: 3, nome: 'Thais Oliveira', numero: 10, posicao: "levantador", foto: "" },
            { id: "F-3-ewelina-wilinska", categoria: "F", idTime: 3, nome: 'Ewelina Wilińska', numero: 3, posicao: "levantador", foto: "" },
            { id: "F-3-ana-lidia", categoria: "F", idTime: 3, nome: 'Ana Lídia', numero: 18, posicao: "oposto", foto: "" },
            { id: "F-3-camila-mesquita", categoria: "F", idTime: 3, nome: 'Camila Mesquita', numero: 4, posicao: "oposto", foto: "" },
            { id: "F-3-emily-guebara", categoria: "F", idTime: 3, nome: 'Emily Guebara', numero: 20, posicao: "ponteiro", foto: "" },
            { id: "F-3-vanessa-janke", categoria: "F", idTime: 3, nome: 'Vanessa Janke', numero: 16, posicao: "ponteiro", foto: "" },
            { id: "F-3-kauany-fonseca", categoria: "F", idTime: 3, nome: 'Kauany Fonseca', numero: 11, posicao: "ponteiro", foto: "" },
            { id: "F-3-ana-luiza", categoria: "F", idTime: 3, nome: 'Ana Luiza', numero: 17, posicao: "ponteiro", foto: "" },
            { id: "F-3-paola-santiago", categoria: "F", idTime: 3, nome: 'Paola Santiago', numero: 15, posicao: "ponteiro", foto: "" },
            { id: "F-3-alexia-cocco", categoria: "F", idTime: 3, nome: 'Alexia Cocco', numero: 7, posicao: "ponteiro", foto: "" },
            { id: "F-3-glaucia-aline", categoria: "F", idTime: 3, nome: 'Glaucia Aline', numero: 5, posicao: "central", foto: "" },
            { id: "F-3-giulia-muralha", categoria: "F", idTime: 3, nome: 'Giulia Muralha', numero: 1, posicao: "central", foto: "" },
            { id: "F-3-milena-silva", categoria: "F", idTime: 3, nome: 'Milena Silva', numero: 8, posicao: "central", foto: "" },
            { id: "F-3-tierney-barlow", categoria: "F", idTime: 3, nome: 'Tierney Barlow', numero: 12, posicao: "central", foto: "" },
            { id: "F-3-katia-larissa", categoria: "F", idTime: 3, nome: 'Kátia Larissa', numero: 6, posicao: "central", foto: "" },
            { id: "F-3-emanuelle-santos", categoria: "F", idTime: 3, nome: 'Emanuelle Santos', numero: 21, posicao: "central", foto: "" },
            { id: "F-3-tassia-sthael", categoria: "F", idTime: 3, nome: 'Tássia Sthael', numero: 9, posicao: "libero", foto: "" },
            { id: "F-3-isabela-abreu", categoria: "F", idTime: 3, nome: 'Isabela Abreu', numero: 14, posicao: "libero", foto: "" },
        ],
        4: [ // Dentil Praia Clube
            { id: "F-4-macris", categoria: "F", idTime: 4, nome: 'Macris', numero: null, posicao: "levantador", foto: "" },
            { id: "F-4-milla", categoria: "F", idTime: 4, nome: 'Milla', numero: null, posicao: "levantador", foto: "" },
            { id: "F-4-fabiola", categoria: "F", idTime: 4, nome: 'Fabíola', numero: null, posicao: "levantador", foto: "" },
            { id: "F-4-sabrina", categoria: "F", idTime: 4, nome: 'Sabrina', numero: null, posicao: "oposto", foto: "" },
            { id: "F-4-carla", categoria: "F", idTime: 4, nome: 'Carla', numero: null, posicao: "oposto", foto: "" },
            { id: "F-4-michelle-pavao", categoria: "F", idTime: 4, nome: 'Michelle Pavão', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-4-sofya-kuznetsova", categoria: "F", idTime: 4, nome: 'Sofya Kuznetsova', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-4-andrea-mitrovic", categoria: "F", idTime: 4, nome: 'Andrea Mitrovic', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-4-drussyla", categoria: "F", idTime: 4, nome: 'Drussyla', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-4-adenizia", categoria: "F", idTime: 4, nome: 'Adenízia', numero: null, posicao: "central", foto: "" },
            { id: "F-4-lara", categoria: "F", idTime: 4, nome: 'Lara', numero: null, posicao: "central", foto: "" },
            { id: "F-4-lanna", categoria: "F", idTime: 4, nome: 'Lanna', numero: null, posicao: "central", foto: "" },
            { id: "F-4-carol", categoria: "F", idTime: 4, nome: 'Carol', numero: null, posicao: "central", foto: "" },
            { id: "F-4-suelen", categoria: "F", idTime: 4, nome: 'Suelen', numero: null, posicao: "libero", foto: "" },
            { id: "F-4-natinha", categoria: "F", idTime: 4, nome: 'Natinha', numero: null, posicao: "libero", foto: "" },
        ],
        5: [ // Fluminense F.C.
            { id: "F-5-priscila-heldes", categoria: "F", idTime: 5, nome: 'Priscila Heldes', numero: null, posicao: "levantador", foto: "" },
            { id: "F-5-betina-vanier-zarth", categoria: "F", idTime: 5, nome: 'Betina Vanier Zarth', numero: null, posicao: "levantador", foto: "" },
            { id: "F-5-amanda-sehn", categoria: "F", idTime: 5, nome: 'Amanda Sehn', numero: null, posicao: "levantador", foto: "" },
            { id: "F-5-ariane-pinto", categoria: "F", idTime: 5, nome: 'Ariane Pinto', numero: null, posicao: "oposto", foto: "" },
            { id: "F-5-ana-clara-medina", categoria: "F", idTime: 5, nome: 'Ana Clara Medina', numero: null, posicao: "oposto", foto: "" },
            { id: "F-5-natalia-danielski", categoria: "F", idTime: 5, nome: 'Natália Danielski', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-5-aline-segato", categoria: "F", idTime: 5, nome: 'Aline Segato', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-5-bianca-bertolino", categoria: "F", idTime: 5, nome: 'Bianca Bertolino', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-5-julia-de-paula", categoria: "F", idTime: 5, nome: 'Júlia de Paula', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-5-victoria-martini", categoria: "F", idTime: 5, nome: 'Victoria Martini', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-5-gabriela-martins", categoria: "F", idTime: 5, nome: 'Gabriela Martins', numero: null, posicao: "central", foto: "" },
            { id: "F-5-valquiria-dullius", categoria: "F", idTime: 5, nome: 'Valquíria Dullius', numero: null, posicao: "central", foto: "" },
            { id: "F-5-camila-paracatu", categoria: "F", idTime: 5, nome: 'Camila Paracatu', numero: null, posicao: "central", foto: "" },
            { id: "F-5-daniela-seibt", categoria: "F", idTime: 5, nome: 'Daniela Seibt', numero: null, posicao: "central", foto: "" },
            { id: "F-5-ana-alice-martins-freitas", categoria: "F", idTime: 5, nome: 'Ana Alice Martins Freitas', numero: null, posicao: "central", foto: "" },
            { id: "F-5-erica-motta-lima-kika", categoria: "F", idTime: 5, nome: 'Erica Motta Lima (Kika)', numero: null, posicao: "libero", foto: "" },
            { id: "F-5-gabriela-santin", categoria: "F", idTime: 5, nome: 'Gabriela Santin', numero: null, posicao: "libero", foto: "" },
        ],
        6: [ // Gerdau Minas
            { id: "F-6-julia-nowicka", categoria: "F", idTime: 6, nome: 'Julia Nowicka', numero: 2, posicao: "levantador", foto: "" },
            { id: "F-6-fran-tomazoni", categoria: "F", idTime: 6, nome: 'Fran Tomazoni', numero: 1, posicao: "levantador", foto: "" },
            { id: "F-6-jheovana", categoria: "F", idTime: 6, nome: 'Jheovana', numero: 5, posicao: "oposto", foto: "" },
            { id: "F-6-amanda-marques", categoria: "F", idTime: 6, nome: 'Amanda Marques', numero: 4, posicao: "oposto", foto: "" },
            { id: "F-6-vallentina-biondo", categoria: "F", idTime: 6, nome: 'Vallentina Biondo', numero: 16, posicao: "oposto", foto: "" },
            { id: "F-6-flormarie-heredia", categoria: "F", idTime: 6, nome: 'Flormarie Heredia', numero: 10, posicao: "ponteiro", foto: "" },
            { id: "F-6-hilary-johnson", categoria: "F", idTime: 6, nome: 'Hilary Johnson', numero: 14, posicao: "ponteiro", foto: "" },
            { id: "F-6-ana-rüdiger", categoria: "F", idTime: 6, nome: 'Ana Rüdiger', numero: 18, posicao: "ponteiro", foto: "" },
            { id: "F-6-maiara-basso", categoria: "F", idTime: 6, nome: 'Maiara Basso', numero: 3, posicao: "ponteiro", foto: "" },
            { id: "F-6-thaisa", categoria: "F", idTime: 6, nome: 'Thaisa', numero: 6, posicao: "central", foto: "" },
            { id: "F-6-julia-koehler", categoria: "F", idTime: 6, nome: 'Júlia Koehler', numero: 9, posicao: "central", foto: "" },
            { id: "F-6-luzia", categoria: "F", idTime: 6, nome: 'Luzia', numero: 11, posicao: "central", foto: "" },
            { id: "F-6-giovana-guimaraes", categoria: "F", idTime: 6, nome: 'Giovana Guimarães', numero: 8, posicao: "central", foto: "" },
            { id: "F-6-nyeme", categoria: "F", idTime: 6, nome: 'Nyeme', numero: 7, posicao: "libero", foto: "" },
            { id: "F-6-larissa-fortes", categoria: "F", idTime: 6, nome: 'Larissa Fortes', numero: 12, posicao: "libero", foto: "" },
        ],
        7: [ // Osasco São Cristóvão Saúde
            { id: "F-7-marta-bechis", categoria: "F", idTime: 7, nome: 'Marta Bechis', numero: null, posicao: "levantador", foto: "" },
            { id: "F-7-ana-berto", categoria: "F", idTime: 7, nome: 'Ana Berto', numero: null, posicao: "levantador", foto: "" },
            { id: "F-7-marina-sioto", categoria: "F", idTime: 7, nome: 'Marina Sioto', numero: null, posicao: "levantador", foto: "" },
            { id: "F-7-magda-stysiak", categoria: "F", idTime: 7, nome: 'Magda Stysiak', numero: null, posicao: "oposto", foto: "" },
            { id: "F-7-lorrayna-da-silva", categoria: "F", idTime: 7, nome: 'Lorrayna da Silva', numero: null, posicao: "oposto", foto: "" },
            { id: "F-7-amanda-campos", categoria: "F", idTime: 7, nome: 'Amanda Campos', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-7-mariana-brambilla", categoria: "F", idTime: 7, nome: 'Mariana Brambilla', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-7-rebeca-borges", categoria: "F", idTime: 7, nome: 'Rebeca Borges', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-7-anastasia-guerra", categoria: "F", idTime: 7, nome: 'Anastasia Guerra', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-7-larissa-besen", categoria: "F", idTime: 7, nome: 'Larissa Besen', numero: null, posicao: "central", foto: "" },
            { id: "F-7-mayhara-francini", categoria: "F", idTime: 7, nome: 'Mayhara Francini', numero: null, posicao: "central", foto: "" },
            { id: "F-7-lara-nascimento", categoria: "F", idTime: 7, nome: 'Lara Nascimento', numero: null, posicao: "central", foto: "" },
            { id: "F-7-lays-fernanda", categoria: "F", idTime: 7, nome: 'Lays Fernanda', numero: null, posicao: "central", foto: "" },
            { id: "F-7-lara-molinari", categoria: "F", idTime: 7, nome: 'Lara Molinari', numero: null, posicao: "libero", foto: "" },
            { id: "F-7-marcelle-arruda", categoria: "F", idTime: 7, nome: 'Marcelle Arruda', numero: null, posicao: "libero", foto: "" },
        ],
        8: [ // Paulistano Barueri
            { id: "F-8-ana-flavia-galvao", categoria: "F", idTime: 8, nome: 'Ana Flávia Galvão', numero: null, posicao: "levantador", foto: "" },
            { id: "F-8-jackeline-moreno-pino", categoria: "F", idTime: 8, nome: 'Jackeline Moreno Pino', numero: null, posicao: "levantador", foto: "" },
            { id: "F-8-evelyn-vitoria-carvalho", categoria: "F", idTime: 8, nome: 'Evelyn Vitória Carvalho', numero: null, posicao: "oposto", foto: "" },
            { id: "F-8-anna-luiza-maccarone", categoria: "F", idTime: 8, nome: 'Anna Luiza Maccarone', numero: null, posicao: "oposto", foto: "" },
            { id: "F-8-camilly-vitoria-salome", categoria: "F", idTime: 8, nome: 'Camilly Vitória Salomé', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-8-pietra-zanchetta-jukoski", categoria: "F", idTime: 8, nome: 'Pietra Zanchetta Jukoski', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-8-gabrielle-eduarda", categoria: "F", idTime: 8, nome: 'Gabrielle Eduarda', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-8-sabrina-vitoria-sassa", categoria: "F", idTime: 8, nome: 'Sabrina Vitória Sassá', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-8-thays-oliveira", categoria: "F", idTime: 8, nome: 'Thays Oliveira', numero: null, posicao: "central", foto: "" },
            { id: "F-8-geovana-vitoria-freitas", categoria: "F", idTime: 8, nome: 'Geovana Vitória Freitas', numero: null, posicao: "central", foto: "" },
            { id: "F-8-thaina-kiarele", categoria: "F", idTime: 8, nome: 'Thaina Kiarele', numero: null, posicao: "central", foto: "" },
            { id: "F-8-ana-luisa-bento", categoria: "F", idTime: 8, nome: 'Ana Luísa Bento', numero: null, posicao: "libero", foto: "" },
            { id: "F-8-sophia-da-cunha-dantas", categoria: "F", idTime: 8, nome: 'Sophia da Cunha Dantas', numero: null, posicao: "libero", foto: "" },
        ],
        9: [ // E.C. Pinheiros
            { id: "F-9-ju-carrijo", categoria: "F", idTime: 9, nome: 'Ju Carrijo', numero: null, posicao: "levantador", foto: "" },
            { id: "F-9-madu-lima", categoria: "F", idTime: 9, nome: 'Madu Lima', numero: null, posicao: "levantador", foto: "" },
            { id: "F-9-camila-maluf", categoria: "F", idTime: 9, nome: 'Camila Maluf', numero: null, posicao: "oposto", foto: "" },
            { id: "F-9-talia-costa", categoria: "F", idTime: 9, nome: 'Talia Costa', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-9-flavia-lisboa", categoria: "F", idTime: 9, nome: 'Flávia Lisboa', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-9-sabrina-groth", categoria: "F", idTime: 9, nome: 'Sabrina Groth', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-9-fernanda-rangel", categoria: "F", idTime: 9, nome: 'Fernanda Rangel', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-9-andressa-gelenski", categoria: "F", idTime: 9, nome: 'Andressa Gelenski', numero: null, posicao: "central", foto: "" },
            { id: "F-9-luana-kuskowski", categoria: "F", idTime: 9, nome: 'Luana Kuskowski', numero: null, posicao: "central", foto: "" },
            { id: "F-9-adria-da-silva", categoria: "F", idTime: 9, nome: 'Adria da Silva', numero: null, posicao: "central", foto: "" },
            { id: "F-9-mariana-medeiros", categoria: "F", idTime: 9, nome: 'Mariana Medeiros', numero: null, posicao: "central", foto: "" },
            { id: "F-9-maria-clara-carvalhaes", categoria: "F", idTime: 9, nome: 'Maria Clara Carvalhaes', numero: null, posicao: "libero", foto: "" },
            { id: "F-9-gabriela-valenga", categoria: "F", idTime: 9, nome: 'Gabriela Valenga', numero: null, posicao: "libero", foto: "" },
            { id: "F-9-audren-mendonca", categoria: "F", idTime: 9, nome: 'Audren Mendonça', numero: null, posicao: "libero", foto: "" },
            { id: "F-9-paola-villegas", categoria: "F", idTime: 9, nome: 'Paola Villegas', numero: null, posicao: "libero", foto: "" },
        ],
        10: [ // Sancor Seguros Vôlei
            { id: "F-10-bruninha", categoria: "F", idTime: 10, nome: 'Bruninha', numero: null, posicao: "levantador", foto: "" },
            { id: "F-10-mikaella", categoria: "F", idTime: 10, nome: 'Mikaella', numero: null, posicao: "levantador", foto: "" },
            { id: "F-10-daniela-cechetto", categoria: "F", idTime: 10, nome: 'Daniela Cechetto', numero: null, posicao: "oposto", foto: "" },
            { id: "F-10-vitoria-parise", categoria: "F", idTime: 10, nome: 'Vitória Parise', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-luiza-vicente", categoria: "F", idTime: 10, nome: 'Luiza Vicente', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-carol-grossi", categoria: "F", idTime: 10, nome: 'Carol Grossi', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-kyra-holt", categoria: "F", idTime: 10, nome: 'Kyra Holt', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-karol-tormena", categoria: "F", idTime: 10, nome: 'Karol Tormena', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-gabi-candido", categoria: "F", idTime: 10, nome: 'Gabi Cândido', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-10-katryne-pires", categoria: "F", idTime: 10, nome: 'Katryne Pires', numero: null, posicao: "central", foto: "" },
            { id: "F-10-rebeca-camile", categoria: "F", idTime: 10, nome: 'Rebeca Camile', numero: null, posicao: "central", foto: "" },
            { id: "F-10-jussara", categoria: "F", idTime: 10, nome: 'Jussara', numero: null, posicao: "central", foto: "" },
            { id: "F-10-ana-marcelin", categoria: "F", idTime: 10, nome: 'Ana Marcelin', numero: null, posicao: "central", foto: "" },
            { id: "F-10-leticia-gomes", categoria: "F", idTime: 10, nome: 'Letícia Gomes', numero: null, posicao: "libero", foto: "" },
            { id: "F-10-anielly", categoria: "F", idTime: 10, nome: 'Anielly', numero: null, posicao: "libero", foto: "" },
        ],
        11: [ // Sesc RJ Flamengo
            { id: "F-11-giovana", categoria: "F", idTime: 11, nome: 'Giovana', numero: null, posicao: "levantador", foto: "" },
            { id: "F-11-vivian", categoria: "F", idTime: 11, nome: 'Vívian', numero: null, posicao: "levantador", foto: "" },
            { id: "F-11-tainara", categoria: "F", idTime: 11, nome: 'Tainara', numero: null, posicao: "oposto", foto: "" },
            { id: "F-11-jaque-schmitz", categoria: "F", idTime: 11, nome: 'Jaque Schmitz', numero: null, posicao: "oposto", foto: "" },
            { id: "F-11-simone-lee", categoria: "F", idTime: 11, nome: 'Simone Lee', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-11-ariele", categoria: "F", idTime: 11, nome: 'Ariele', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-11-karina", categoria: "F", idTime: 11, nome: 'Karina', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-11-mikaela", categoria: "F", idTime: 11, nome: 'Mikaela', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-11-lorena", categoria: "F", idTime: 11, nome: 'Lorena', numero: null, posicao: "central", foto: "" },
            { id: "F-11-juju", categoria: "F", idTime: 11, nome: 'Juju', numero: null, posicao: "central", foto: "" },
            { id: "F-11-masa-kirov", categoria: "F", idTime: 11, nome: 'Maša Kirov', numero: null, posicao: "central", foto: "" },
            { id: "F-11-minja-osmajic", categoria: "F", idTime: 11, nome: 'Minja Osmajić', numero: null, posicao: "central", foto: "" },
            { id: "F-11-bia-paranhos", categoria: "F", idTime: 11, nome: 'Bia Paranhos', numero: null, posicao: "central", foto: "" },
            { id: "F-11-lais", categoria: "F", idTime: 11, nome: 'Laís', numero: null, posicao: "libero", foto: "" },
            { id: "F-11-victoria-stadler", categoria: "F", idTime: 11, nome: 'Victoria Stadler', numero: null, posicao: "libero", foto: "" },
        ],
        12: [ // Sesi Vôlei Bauru
            { id: "F-12-amanda-mutuano", categoria: "F", idTime: 12, nome: 'Amanda Mutuano', numero: null, posicao: "levantador", foto: "" },
            { id: "F-12-claudinha", categoria: "F", idTime: 12, nome: 'Claudinha', numero: null, posicao: "levantador", foto: "" },
            { id: "F-12-dani-lins", categoria: "F", idTime: 12, nome: 'Dani Lins', numero: null, posicao: "levantador", foto: "" },
            { id: "F-12-bruna-moraes", categoria: "F", idTime: 12, nome: 'Bruna Moraes', numero: null, posicao: "oposto", foto: "" },
            { id: "F-12-morgahn-fingall", categoria: "F", idTime: 12, nome: 'Morgahn Fingall', numero: null, posicao: "oposto", foto: "" },
            { id: "F-12-isa-rocha", categoria: "F", idTime: 12, nome: 'Isa Rocha', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-12-giovanna", categoria: "F", idTime: 12, nome: 'Giovanna', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-12-maira", categoria: "F", idTime: 12, nome: 'Maira', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-12-roslandy-acosta", categoria: "F", idTime: 12, nome: 'Roslandy Acosta', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-12-sofia-maldonado", categoria: "F", idTime: 12, nome: 'Sofia Maldonado', numero: null, posicao: "ponteiro", foto: "" },
            { id: "F-12-diana", categoria: "F", idTime: 12, nome: 'Diana', numero: null, posicao: "central", foto: "" },
            { id: "F-12-lara", categoria: "F", idTime: 12, nome: 'Lara', numero: null, posicao: "central", foto: "" },
            { id: "F-12-livia", categoria: "F", idTime: 12, nome: 'Lívia', numero: null, posicao: "central", foto: "" },
            { id: "F-12-milka", categoria: "F", idTime: 12, nome: 'Milka', numero: null, posicao: "central", foto: "" },
            { id: "F-12-leticia-lele", categoria: "F", idTime: 12, nome: 'Letícia (Lelê)', numero: null, posicao: "libero", foto: "" },
            { id: "F-12-sofia-will", categoria: "F", idTime: 12, nome: 'Sofia Will', numero: null, posicao: "libero", foto: "" },
        ],
    },
    M: { // Superliga Masculina
        1: [ // Sesi Bauru
            { id: "M-1-pureza", categoria: "M", idTime: 1, nome: 'Pureza', numero: null, posicao: "levantador", foto: "" },
        ],
        4: [ // Itambé Minas
            { id: "M-4-thiago-veloso", categoria: "M", idTime: 4, nome: 'Thiago Veloso', numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-mateus-winck", categoria: "M", idTime: 4, nome: 'Mateus Winck', numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-henrique-veiga", categoria: "M", idTime: 4, nome: 'Henrique Veiga', numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-bryan-lucas", categoria: "M", idTime: 4, nome: 'Bryan Lucas', numero: null, posicao: "oposto", foto: "" },
            { id: "M-4-jose-masso", categoria: "M", idTime: 4, nome: 'José Masso', numero: null, posicao: "oposto", foto: "" },
            { id: "M-4-ricardo-lucarelli", categoria: "M", idTime: 4, nome: 'Ricardo Lucarelli', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-henrique-honorato", categoria: "M", idTime: 4, nome: 'Henrique Honorato', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-daniel-muniz", categoria: "M", idTime: 4, nome: 'Daniel Muniz', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-joao-luzeiro", categoria: "M", idTime: 4, nome: 'João Luzeiro', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-diogo-dos-anjos", categoria: "M", idTime: 4, nome: 'Diogo dos Anjos', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-michel-saraiva", categoria: "M", idTime: 4, nome: 'Michel Saraiva', numero: null, posicao: "central", foto: "" },
            { id: "M-4-geovane-kuhnen", categoria: "M", idTime: 4, nome: 'Geovane Kuhnen', numero: null, posicao: "central", foto: "" },
            { id: "M-4-pietro-santos", categoria: "M", idTime: 4, nome: 'Pietro Santos', numero: null, posicao: "central", foto: "" },
            { id: "M-4-matheus-dobkowski", categoria: "M", idTime: 4, nome: 'Matheus Dobkowski', numero: null, posicao: "central", foto: "" },
            { id: "M-4-lucas-cambuim", categoria: "M", idTime: 4, nome: 'Lucas Cambuim', numero: null, posicao: "central", foto: "" },
            { id: "M-4-maique-reis", categoria: "M", idTime: 4, nome: 'Maique Reis', numero: null, posicao: "libero", foto: "" },
        ],
        8: [ // Praia Clube Uberlandia Vôlei
            { id: "M-8-rhesley", categoria: "M", idTime: 8, nome: 'Rhesley', numero: null, posicao: "levantador", foto: "" },
            { id: "M-8-rafael-forster", categoria: "M", idTime: 8, nome: 'Rafael Forster', numero: null, posicao: "levantador", foto: "" },
            { id: "M-8-lucas-rocha", categoria: "M", idTime: 8, nome: 'Lucas Rocha', numero: null, posicao: "levantador", foto: "" },
            { id: "M-8-franco", categoria: "M", idTime: 8, nome: 'Franco', numero: null, posicao: "oposto", foto: "" },
            { id: "M-8-wesleen", categoria: "M", idTime: 8, nome: 'Wesleen', numero: null, posicao: "oposto", foto: "" },
            { id: "M-8-paulo-vinicios", categoria: "M", idTime: 8, nome: 'Paulo Vinicios', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-lucas-loh", categoria: "M", idTime: 8, nome: 'Lucas Lóh', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-ryan", categoria: "M", idTime: 8, nome: 'Ryan', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-wilson", categoria: "M", idTime: 8, nome: 'Wilson', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-joaquim", categoria: "M", idTime: 8, nome: 'Joaquim', numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-isac", categoria: "M", idTime: 8, nome: 'Isac', numero: null, posicao: "central", foto: "" },
            { id: "M-8-wennder", categoria: "M", idTime: 8, nome: 'Wennder', numero: null, posicao: "central", foto: "" },
            { id: "M-8-rhyan-wagner", categoria: "M", idTime: 8, nome: 'Rhyan Wagner', numero: null, posicao: "central", foto: "" },
            { id: "M-8-guilherme-voss", categoria: "M", idTime: 8, nome: 'Guilherme Voss', numero: null, posicao: "central", foto: "" },
            { id: "M-8-filipinho", categoria: "M", idTime: 8, nome: 'Filipinho', numero: null, posicao: "libero", foto: "" },
        ],
    },
};

// Lista plana mantida para compatibilidade com o restante do VolleyStats.
const ATLETAS_BASE = Object.values(ELENCOS_SUPERLIGA)
    .flatMap((equipes) => Object.values(equipes))
    .flat();

// Atalho para consultar rapidamente o elenco de uma equipe: ATLETAS_POR_EQUIPE.F[6].
const ATLETAS_POR_EQUIPE = ELENCOS_SUPERLIGA;

// Lê do navegador; se estiver vazio, usa os dados publicados (quem nunca lançou nada vê o dados.json)
function ler(chave) {
    let local = [];
    try { local = JSON.parse(localStorage.getItem(chave)) || []; } catch (e) { /* ignora */ }
    if (chave === K_ATLETAS) {
        // O código é a fonte-base; preserva personalizações locais sem duplicar IDs.
        const mesclados = new Map(ATLETAS_BASE.map((a) => [a.id, { ...a }]));
        const idsAntigosDaSelecao = new Set([
            "F-6-thaisa", "F-6-luzia", "F-6-nyeme", "F-11-tainara", "F-11-vivian",
            "F-11-lorena", "F-12-diana", "F-7-marcelle", "F-4-sabrina",
            "M-4-lucarelli", "M-4-maique", "M-4-honorato", "M-4-bryan",
            "M-9-brasilia", "M-1-pureza", "M-2-matheus-pinta"
        ]);
        const normalizarNome = (nome) => semAcento(String(nome || "").trim()).replace(/\s+/g, " ");
        (local.length ? local : (DADOS_PUBLICOS[chave] || [])).forEach((a) => {
            // Remove IDs da lista antiga de destaques da Seleção.
            if (idsAntigosDaSelecao.has(a.id)) return;
            // Registros antigos podem ter outro ID, mas representar a mesma atleta do elenco-base.
            const correspondente = ATLETAS_BASE.find((base) =>
                String(base.categoria) === String(a.categoria) &&
                String(base.idTime) === String(a.idTime) &&
                normalizarNome(base.nome) === normalizarNome(a.nome));
            if (correspondente) {
                mesclados.set(correspondente.id, {
                    ...correspondente,
                    ...a,
                    id: correspondente.id,
                    numero: a.numero ?? correspondente.numero,
                    posicao: a.posicao || correspondente.posicao,
                    foto: a.foto || correspondente.foto
                });
            } else {
                mesclados.set(a.id, { ...(mesclados.get(a.id) || {}), ...a });
            }
        });
        return [...mesclados.values()];
    }
    return local.length ? local : (DADOS_PUBLICOS[chave] || []);
}

// Busca o dados.json (na mesma pasta do index.html). Se não existir ou falhar, segue sem ele.
async function carregarDadosPublicos() {
    try {
        const resp = await fetch("dados.json", { cache: "no-store" });
        if (!resp.ok) return;
        const d = await resp.json();
        DADOS_PUBLICOS[K_ATLETAS] = Array.isArray(d.atletas) ? d.atletas : [];
        DADOS_PUBLICOS[K_JOGADAS] = Array.isArray(d.jogadas) ? d.jogadas : [];
        DADOS_PUBLICOS[K_JOGOS] = Array.isArray(d.jogos) ? d.jogos : [];
    } catch (e) { /* abrir o index.html direto do disco (file://) bloqueia o fetch: sem problema */ }
}
function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) {
        alert("Não foi possível salvar: o espaço do navegador pode estar cheio. Exporte um backup e use fotos menores.");
        return false;
    }
}

// Totais de cada atleta: Map(idAtleta → { ataque, bloqueio, saque, erro, pontos, jogos })
function totaisDosAtletas(atletas, jogadas) {
    const zerado = () => ({ ...Object.fromEntries(STATS.map((s) => [s.chave, 0])), pontos: 0, jogos: new Set() });
    const mapa = new Map(atletas.map((a) => [a.id, zerado()]));
    jogadas.forEach((j) => {
        const t = mapa.get(j.idAtleta), s = STATS.find((x) => x.chave === j.tipo);
        if (!t || !s) return;
        t[s.chave]++;
        t.jogos.add(j.idJogo);
        if (s.tipo === "ponto") t.pontos++;
    });
    mapa.forEach((t) => { t.jogos = t.jogos.size; });
    return mapa;
}

// ===== CALENDÁRIO (compartilhado) =====
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
function dataCurta(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return `${DIAS_SEMANA[new Date(a, m - 1, d).getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}
const rotuloJogo = (j) => j.aDefinir ? "Data a definir" : `${dataCurta(j.data)} · ${j.hora}`;

// Rodada = fase + número: "T-1" = Turno · Rodada 1, "R-3" = Returno · Rodada 3
const chaveRodada = (j) => `${j.fase}-${j.rodada}`;
const rotuloRodada = (chave) => {
    const [fase, n] = chave.split("-");
    return `${fase === "T" ? "Turno" : "Returno"} · Rodada ${n}`;
};
const rodadasDe = (lista) => [...new Set(lista.map(chaveRodada))];   // na ordem do calendário
// Rodada inicial: a primeira que ainda tem jogo sem resultado (ou a última, se tudo já foi jogado)
const rodadaPadrao = (lista) => {
    const rodadas = rodadasDe(lista);
    return rodadas.find((r) => lista.some((j) => chaveRodada(j) === r && !j.jogado)) || rodadas[rodadas.length - 1] || "";
};

// Jogos = calendário do teams.js + resultados já salvos no navegador (ligados pelo idJogo)
function montarJogos() {
    const salvos = new Map(ler(K_JOGOS).map((j) => [j.idJogo, j]));
    return listaJogosPadrao.map((j) => {
        const base = { ...j, setsMandante: null, setsVisitante: null, jogado: false };
        const s = salvos.get(j.idJogo);
        return s && s.jogado ? { ...base, setsMandante: s.setsMandante, setsVisitante: s.setsVisitante, jogado: true } : base;
    });
}