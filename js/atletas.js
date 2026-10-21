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
    { chave: "saque", rotulo: "Saque", tipo: "ponto" }
    // Não existe mais erro individual: o erro é lançado só pelo botão "Erro do time" no placar (tipo "erro_time")
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
            { id: "F-1-rose", categoria: "F", idTime: 1, nome: 'Rose', numero: 1, posicao: "levantador", foto: "Fotos-Atletas/mackenzie/rose.webp" },
            { id: "F-1-lyara", categoria: "F", idTime: 1, nome: 'Lyara', numero: 9, posicao: "levantador", foto: "Fotos-Atletas/mackenzie/lyara.webp" },
            { id: "F-1-julia-eduarda", categoria: "F", idTime: 1, nome: 'Júlia Eduarda', numero: 17, posicao: "levantador", foto: "Fotos-Atletas/mackenzie/julia.webp" },
            { id: "F-1-maeva-orle", categoria: "F", idTime: 1, nome: 'Maëva Orlé', numero: 7, posicao: "oposto", foto: "Fotos-Atletas/mackenzie/maeva.webp" },
            { id: "F-1-arianne", categoria: "F", idTime: 1, nome: 'Arianne', numero: 10, posicao: "oposto", foto: "Fotos-Atletas/mackenzie/arianne.webp" },
            { id: "F-1-clarinha", categoria: "F", idTime: 1, nome: 'Clarinha', numero: 8, posicao: "ponteiro", foto: "Fotos-Atletas/mackenzie/clarinha.webp" },
            { id: "F-1-geovanna", categoria: "F", idTime: 1, nome: 'Geovanna', numero: 16, posicao: "ponteiro", foto: "Fotos-Atletas/mackenzie/geovanna.webp" },
            { id: "F-1-roberta", categoria: "F", idTime: 1, nome: 'Roberta', numero: 18, posicao: "ponteiro", foto: "Fotos-Atletas/mackenzie/roberta.webp" },
            { id: "F-1-paula-mohr", categoria: "F", idTime: 1, nome: 'Paula Mohr', numero: 12, posicao: "ponteiro", foto: "Fotos-Atletas/mackenzie/paula.webp" },
            { id: "F-1-malu", categoria: "F", idTime: 1, nome: 'Malu', numero: 5, posicao: "ponteiro", foto: "Fotos-Atletas/mackenzie/malu.webp" },
            { id: "F-1-kelly", categoria: "F", idTime: 1, nome: 'Kelly', numero: 13, posicao: "central", foto: "Fotos-Atletas/mackenzie/kelly.webp" },
            { id: "F-1-saraelen", categoria: "F", idTime: 1, nome: 'Saraelen', numero: 3, posicao: "central", foto: "Fotos-Atletas/mackenzie/saraelen.webp" },
            { id: "F-1-jocelyn-urias", categoria: "F", idTime: 1, nome: 'Jocelyn Urias', numero: 11, posicao: "central", foto: "Fotos-Atletas/mackenzie/urias.webp" },
            { id: "F-1-lia-rosa", categoria: "F", idTime: 1, nome: 'Lia Rosa', numero: 2, posicao: "central", foto: "Fotos-Atletas/mackenzie/lia.webp" },
            { id: "F-1-aline", categoria: "F", idTime: 1, nome: 'Aline', numero: 20, posicao: "central", foto: "Fotos-Atletas/mackenzie/aline.webp" },
            { id: "F-1-paulina", categoria: "F", idTime: 1, nome: 'Paulina', numero: 15, posicao: "libero", foto: "Fotos-Atletas/mackenzie/paulina.webp" },
            { id: "F-1-gabrielly", categoria: "F", idTime: 1, nome: 'Gabrielly', numero: 4, posicao: "libero", foto: "Fotos-Atletas/mackenzie/gabrielly.webp" },
        ],
        2: [ // Brasília Vôlei/BRB
            { id: "F-2-ana-paula", categoria: "F", idTime: 2, nome: 'Ana Paula', numero: 11, posicao: "levantador", foto: "" },
            { id: "F-2-clara", categoria: "F", idTime: 2, nome: 'Clara', numero: 1, posicao: "levantador", foto: "" },
            { id: "F-2-gabi-carneiro", categoria: "F", idTime: 2, nome: 'Gabi Carneiro', numero: 13, posicao: "oposto", foto: "" },
            { id: "F-2-karen", categoria: "F", idTime: 2, nome: 'Karen', numero: 5, posicao: "oposto", foto: "" },
            { id: "F-2-manu", categoria: "F", idTime: 2, nome: 'Manu', numero: 10, posicao: "ponteiro", foto: "" },
            { id: "F-2-milca", categoria: "F", idTime: 2, nome: 'Milca', numero: 55, posicao: "ponteiro", foto: "" },
            { id: "F-2-beatriz", categoria: "F", idTime: 2, nome: 'Beatriz', numero: 15, posicao: "ponteiro", foto: "" },
            { id: "F-2-thay", categoria: "F", idTime: 2, nome: 'Thay', numero: 6, posicao: "ponteiro", foto: "" },
            { id: "F-2-fran-jacintho", categoria: "F", idTime: 2, nome: 'Fran Jacintho', numero: 3, posicao: "central", foto: "" },
            { id: "F-2-dayana-martinez", categoria: "F", idTime: 2, nome: 'Day Martínez', numero: 19, posicao: "central", foto: "" },
            { id: "F-2-vivi-goes", categoria: "F", idTime: 2, nome: 'Vivi Goes', numero: 8, posicao: "central", foto: "" },
            { id: "F-2-ana-sauer", categoria: "F", idTime: 2, nome: 'Ana Sauer', numero: 18, posicao: "libero", foto: "" },
            { id: "F-2-vitoria", categoria: "F", idTime: 2, nome: 'Vitória', numero: 12, posicao: "libero", foto: "" },
        ],
        3: [ // Brusque Vôlei
            { id: "F-3-isis-simonetti", categoria: "F", idTime: 3, nome: 'Ísis Simonetti', numero: 2, posicao: "levantador", foto: "Fotos-Atletas/brusque/isis.webp" },
            { id: "F-3-thais-oliveira", categoria: "F", idTime: 3, nome: 'Thais Oliveira', numero: 10, posicao: "levantador", foto: "Fotos-Atletas/brusque/thais.webp" },
            { id: "F-3-ewelina-wilinska", categoria: "F", idTime: 3, nome: 'Ewelina Wilińska', numero: 3, posicao: "levantador", foto: "Fotos-Atletas/brusque/ewelina.webp" },
            { id: "F-3-ana-lidia", categoria: "F", idTime: 3, nome: 'Ana Lídia', numero: 18, posicao: "oposto", foto: "Fotos-Atletas/brusque/ana-lidia.webp" },
            { id: "F-3-camila-mesquita", categoria: "F", idTime: 3, nome: 'Camila Mesquita', numero: 4, posicao: "oposto", foto: "Fotos-Atletas/brusque/camila-mesquita.webp" },
            { id: "F-3-emily-guebara", categoria: "F", idTime: 3, nome: 'Emily Guebara', numero: 20, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/emily.webp" },
            { id: "F-3-vanessa-janke", categoria: "F", idTime: 3, nome: 'Vanessa Janke', numero: 16, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/vanessa.webp" },
            { id: "F-3-kauany-fonseca", categoria: "F", idTime: 3, nome: 'Kauany Fonseca', numero: 11, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/kauany.webp" },
            { id: "F-3-ana-luiza", categoria: "F", idTime: 3, nome: 'Ana Luiza', numero: 17, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/ana-luiza.webp" },
            { id: "F-3-paola-santiago", categoria: "F", idTime: 3, nome: 'Paola Santiago', numero: 15, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/paola.webp" },
            { id: "F-3-alexia-cocco", categoria: "F", idTime: 3, nome: 'Alexia Cocco', numero: 7, posicao: "ponteiro", foto: "Fotos-Atletas/brusque/alexia.webp" },
            { id: "F-3-glaucia-aline", categoria: "F", idTime: 3, nome: 'Glaucia Aline', numero: 5, posicao: "central", foto: "Fotos-Atletas/brusque/glaucia.webp" },
            { id: "F-3-giulia-muralha", categoria: "F", idTime: 3, nome: 'Giulia Muralha', numero: 1, posicao: "central", foto: "Fotos-Atletas/brusque/giulia.webp" },
            { id: "F-3-milena-silva", categoria: "F", idTime: 3, nome: 'Milena Silva', numero: 8, posicao: "central", foto: "Fotos-Atletas/brusque/milena.webp" },
            { id: "F-3-tierney-barlow", categoria: "F", idTime: 3, nome: 'Tierney Barlow', numero: 12, posicao: "central", foto: "Fotos-Atletas/brusque/tierney.webp" },
            { id: "F-3-katia-larissa", categoria: "F", idTime: 3, nome: 'Kátia Larissa', numero: 6, posicao: "central", foto: "Fotos-Atletas/brusque/katia.webp" },
            { id: "F-3-emanuelle-santos", categoria: "F", idTime: 3, nome: 'Emanuelle Santos', numero: 21, posicao: "central", foto: "Fotos-Atletas/brusque/emanuelle.webp" },
            { id: "F-3-tassia-sthael", categoria: "F", idTime: 3, nome: 'Tássia Sthael', numero: 9, posicao: "libero", foto: "Fotos-Atletas/brusque/tassia.webp" },
            { id: "F-3-isabela-abreu", categoria: "F", idTime: 3, nome: 'Isabela Abreu', numero: 14, posicao: "libero", foto: "Fotos-Atletas/brusque/isabela.webp" },
        ],
        4: [ // Dentil Praia Clube
            { id: "F-4-macris", categoria: "F", idTime: 4, nome: 'Macris', numero: null, posicao: "levantador", foto: "Fotos-Atletas/praia/macris.webp" },
            { id: "F-4-milla", categoria: "F", idTime: 4, nome: 'Milla', numero: null, posicao: "levantador", foto: "Fotos-Atletas/praia/milla.webp" },
            { id: "F-4-fabiola", categoria: "F", idTime: 4, nome: 'Fabíola', numero: null, posicao: "levantador", foto: "Fotos-Atletas/praia/fabiola.webp" },
            { id: "F-4-sabrina", categoria: "F", idTime: 4, nome: 'Sabrina', numero: null, posicao: "oposto", foto: "Fotos-Atletas/praia/sabrina.webp" },
            { id: "F-4-carla", categoria: "F", idTime: 4, nome: 'Carla', numero: null, posicao: "oposto", foto: "Fotos-Atletas/praia/carla.webp" },
            { id: "F-4-michelle-pavao", categoria: "F", idTime: 4, nome: 'Michelle Pavão', numero: null, posicao: "ponteiro", foto: "Fotos-Atletas/praia/michelle.webp" },
            { id: "F-4-sofya-kuznetsova", categoria: "F", idTime: 4, nome: 'Sofya Kuznetsova', numero: null, posicao: "ponteiro", foto: "Fotos-Atletas/praia/kuznetsova.webp" },
            { id: "F-4-andrea-mitrovic", categoria: "F", idTime: 4, nome: 'Andrea Mitrovic', numero: null, posicao: "ponteiro", foto: "Fotos-Atletas/praia/mitrovic.webp" },
            { id: "F-4-drussyla", categoria: "F", idTime: 4, nome: 'Drussyla', numero: null, posicao: "ponteiro", foto: "Fotos-Atletas/praia/drussyla.webp" },
            { id: "F-4-adenizia", categoria: "F", idTime: 4, nome: 'Adenízia', numero: null, posicao: "central", foto: "Fotos-Atletas/praia/adenizia.webp" },
            { id: "F-4-lara", categoria: "F", idTime: 4, nome: 'Lara', numero: null, posicao: "central", foto: "Fotos-Atletas/praia/lara.webp" },
            { id: "F-4-lanna", categoria: "F", idTime: 4, nome: 'Lanna', numero: null, posicao: "central", foto: "Fotos-Atletas/praia/lanna.webp" },
            { id: "F-4-carol", categoria: "F", idTime: 4, nome: 'Carol', numero: null, posicao: "central", foto: "Fotos-Atletas/praia/carol.webp" },
            { id: "F-4-suelen", categoria: "F", idTime: 4, nome: 'Suelen', numero: null, posicao: "libero", foto: "Fotos-Atletas/praia/suelen.webp" },
            { id: "F-4-natinha", categoria: "F", idTime: 4, nome: 'Natinha', numero: null, posicao: "libero", foto: "Fotos-Atletas/praia/natinha.webp" },
        ],
        5: [ // Fluminense F.C.
            { id: "F-5-priscila-heldes", categoria: "F", idTime: 5, nome: 'Priscila Heldes', numero: 11, posicao: "levantador", foto: "Fotos-Atletas/fluminense/pri_heldes.webp" },
            { id: "F-5-betina-vanier-zarth", categoria: "F", idTime: 5, nome: 'Betina Zarth', numero: 18, posicao: "levantador", foto: "Fotos-Atletas/fluminense/betina.webp" },
            { id: "F-5-amanda-sehn", categoria: "F", idTime: 5, nome: 'Amanda Sehn', numero: 6, posicao: "levantador", foto: "Fotos-Atletas/fluminense/amanda.webp" },
            { id: "F-5-ariane-pinto", categoria: "F", idTime: 5, nome: 'Ariane Pinto', numero: 13, posicao: "oposto", foto: "Fotos-Atletas/fluminense/ariane.webp" },
            { id: "F-5-ana-clara-medina", categoria: "F", idTime: 5, nome: 'Ana Clara Medina', numero: 8, posicao: "oposto", foto: "Fotos-Atletas/fluminense/ana_medina.webp" },
            { id: "F-5-natalia-danielski", categoria: "F", idTime: 5, nome: 'Natália Danielski', numero: 2, posicao: "ponteiro", foto: "Fotos-Atletas/fluminense/natalia.webp" },
            { id: "F-5-aline-segato", categoria: "F", idTime: 5, nome: 'Aline Segato', numero: 7, posicao: "ponteiro", foto: "Fotos-Atletas/fluminense/aline.webp" },
            { id: "F-5-bianca-bertolino", categoria: "F", idTime: 5, nome: 'Bianca Bertolino', numero: 5, posicao: "ponteiro", foto: "Fotos-Atletas/fluminense/bianca.webp" },
            { id: "F-5-julia-de-paula", categoria: "F", idTime: 5, nome: 'Júlia de Paula', numero: 1, posicao: "ponteiro", foto: "Fotos-Atletas/fluminense/julia.webp" },
            { id: "F-5-victoria-martini", categoria: "F", idTime: 5, nome: 'Vic Martini', numero: 3, posicao: "ponteiro", foto: "Fotos-Atletas/fluminense/vic.webp" },
            { id: "F-5-gabriela-martins", categoria: "F", idTime: 5, nome: 'Gabi Martins', numero: 9, posicao: "central", foto: "Fotos-Atletas/fluminense/gabi_martins.webp" },
            { id: "F-5-valquiria-dullius", categoria: "F", idTime: 5, nome: 'Valquíria Dullius', numero: 10, posicao: "central", foto: "Fotos-Atletas/fluminense/valquiria.webp" },
            { id: "F-5-camila-paracatu", categoria: "F", idTime: 5, nome: 'Camila Paracatu', numero: 15, posicao: "central", foto: "Fotos-Atletas/fluminense/paracatu.webp" },
            { id: "F-5-daniela-seibt", categoria: "F", idTime: 5, nome: 'Daniela Seibt', numero: 4, posicao: "central", foto: "Fotos-Atletas/fluminense/daniela.webp" },
            { id: "F-5-erica-motta-lima-kika", categoria: "F", idTime: 5, nome: 'Erica Motta Lima (Kika)', numero: 21, posicao: "libero", foto: "Fotos-Atletas/fluminense/kika.webp" },
            { id: "F-5-gabriela-santin", categoria: "F", idTime: 5, nome: 'Gabriela Santin', numero: 17, posicao: "libero", foto: "Fotos-Atletas/fluminense/gabi_santin.webp" },
        ],
        6: [ // Gerdau Minas
            { id: "F-6-julia-nowicka", categoria: "F", idTime: 6, nome: 'Julia Nowicka', numero: 2, posicao: "levantador", foto: "Fotos-Atletas/minas/nowicka.webp" },
            { id: "F-6-fran-tomazoni", categoria: "F", idTime: 6, nome: 'Fran Tomazoni', numero: 1, posicao: "levantador", foto: "Fotos-Atletas/minas/Fran.png" },
            { id: "F-6-jheovana", categoria: "F", idTime: 6, nome: 'Jheovana', numero: 5, posicao: "oposto", foto: "Fotos-Atletas/minas/jheovana.webp" },
            { id: "F-6-amanda-marques", categoria: "F", idTime: 6, nome: 'Amanda Marques', numero: 4, posicao: "oposto", foto: "Fotos-Atletas/minas/amanda.webp" },
            { id: "F-6-vallentina-biondo", categoria: "F", idTime: 6, nome: 'Vallentina Biondo', numero: 16, posicao: "oposto", foto: "Fotos-Atletas/minas/Vallentina.png" },
            { id: "F-6-flormarie-heredia", categoria: "F", idTime: 6, nome: 'Flormarie Heredia', numero: 10, posicao: "ponteiro", foto: "Fotos-Atletas/minas/Flormarie.png" },
            { id: "F-6-hilary-johnson", categoria: "F", idTime: 6, nome: 'Hilary Johnson', numero: 14, posicao: "ponteiro", foto: "Fotos-Atletas/minas/hilary.webp" },
            { id: "F-6-ana-rüdiger", categoria: "F", idTime: 6, nome: 'Ana Rüdiger', numero: 18, posicao: "ponteiro", foto: "Fotos-Atletas/minas/rudiger.webp" },
            { id: "F-6-maiara-basso", categoria: "F", idTime: 6, nome: 'Maiara Basso', numero: 3, posicao: "ponteiro", foto: "Fotos-Atletas/minas/basso.webp" },
            { id: "F-6-thaisa", categoria: "F", idTime: 6, nome: 'Thaisa', numero: 6, posicao: "central", foto: "Fotos-Atletas/minas/thaisa.webp" },
            { id: "F-6-julia-koehler", categoria: "F", idTime: 6, nome: 'Júlia Koehler', numero: 9, posicao: "central", foto: "Fotos-Atletas/minas/koehler.webp" },
            { id: "F-6-luzia", categoria: "F", idTime: 6, nome: 'Luzia', numero: 11, posicao: "central", foto: "Fotos-Atletas/minas/luzia.webp" },
            { id: "F-6-giovana-guimaraes", categoria: "F", idTime: 6, nome: 'Giovana Guimarães', numero: 8, posicao: "central", foto: "Fotos-Atletas/minas/giovana.webp" },
            { id: "F-6-nyeme", categoria: "F", idTime: 6, nome: 'Nyeme', numero: 7, posicao: "libero", foto: "Fotos-Atletas/minas/nyeme.webp" },
            { id: "F-6-larissa-fortes", categoria: "F", idTime: 6, nome: 'Larissa Fortes', numero: 12, posicao: "libero", foto: "Fotos-Atletas/minas/larissa.webp" },
        ],
        7: [ // Osasco São Cristóvão Saúde
            { id: "F-7-marta-bechis", categoria: "F", idTime: 7, nome: 'Marta Bechis', numero: 33, posicao: "levantador", foto: "Fotos-Atletas/osasco/marta.webp" },
            { id: "F-7-marina-sioto", categoria: "F", idTime: 7, nome: 'Marina Sioto', numero: 16, posicao: "levantador", foto: "Fotos-Atletas/osasco/marina.webp" },
            { id: "F-7-magdalena-stysiak", categoria: "F", idTime: 7, nome: 'Magdalena Stysiak', numero: 3, posicao: "oposto", foto: "Fotos-Atletas/osasco/stysiak.webp" },
            { id: "F-7-lorrayna-da-silva", categoria: "F", idTime: 7, nome: 'Lorrayna da Silva', numero: 17, posicao: "oposto", foto: "Fotos-Atletas/osasco/lorrayna.webp" },
            { id: "F-7-amanda-campos", categoria: "F", idTime: 7, nome: 'Amanda Campos', numero: 13, posicao: "ponteiro", foto: "Fotos-Atletas/osasco/amanda.webp" },
            { id: "F-7-mariana-brambilla", categoria: "F", idTime: 7, nome: 'Mari Brambilla', numero: 15, posicao: "ponteiro", foto: "Fotos-Atletas/osasco/mari-brambilla.webp" },
            { id: "F-7-rebeca-borges", categoria: "F", idTime: 7, nome: 'Rebeca Borges', numero: 19, posicao: "ponteiro", foto: "Fotos-Atletas/osasco/rebeca.webp" },
            { id: "F-7-anastasia-guerra", categoria: "F", idTime: 7, nome: 'Anastasia Guerra', numero: 6, posicao: "ponteiro", foto: "Fotos-Atletas/osasco/anastasia.webp" },
            { id: "F-7-tifanny-abreu", categoria: "F", idTime: 7, nome: 'Tifanny Abreu', numero: 9, posicao: "ponteiro", foto: "Fotos-Atletas/osasco/tifanny.webp" },
            { id: "F-7-larissa-besen", categoria: "F", idTime: 7, nome: 'Larissa Besen', numero: 14, posicao: "central", foto: "Fotos-Atletas/osasco/larissa.webp" },
            { id: "F-7-mayhara-francini", categoria: "F", idTime: 7, nome: 'Mayhara Francini', numero: 2, posicao: "central", foto: "Fotos-Atletas/osasco/mayhara.webp" },
            { id: "F-7-lara-nascimento", categoria: "F", idTime: 7, nome: 'Lara Nascimento', numero: 5, posicao: "central", foto: "Fotos-Atletas/osasco/lara.webp" },
            { id: "F-7-lays-fernanda", categoria: "F", idTime: 7, nome: 'Lays Fernanda', numero: 7, posicao: "central", foto: "Fotos-Atletas/osasco/lays.webp" },
            { id: "F-7-lara-molinari", categoria: "F", idTime: 7, nome: 'Lara Molinari', numero: 1, posicao: "libero", foto: "Fotos-Atletas/osasco/lara-molinari.webp" },
            { id: "F-7-keyla-alves", categoria: "F", idTime: 7, nome: 'Key Alves', numero: 10, posicao: "libero", foto: "Fotos-Atletas/osasco/key.webp" },
            { id: "F-7-marcelle-arruda", categoria: "F", idTime: 7, nome: 'Marcelle Arruda', numero: 22, posicao: "libero", foto: "Fotos-Atletas/osasco/marcelle.webp" }
        ],
        8: [ // Paulistano Barueri
            { id: "F-8-ana-flavia-galvao", categoria: "F", idTime: 8, nome: 'Ana Flávia Galvão', numero: 13, posicao: "levantador", foto: "Fotos-Atletas/barueri/ana-flavia.webp" },
            { id: "F-8-jackeline-moreno", categoria: "F", idTime: 8, nome: 'Jacke Moreno', numero: 1, posicao: "levantador", foto: "Fotos-Atletas/barueri/jacke.webp"},
            { id: "F-8-evelyn-carvalho", categoria: "F", idTime: 8, nome: 'Evelyn Carvalho', numero: 4, posicao: "oposto", foto: "Fotos-Atletas/barueri/evelyn.webp" },
            { id: "F-8-anna-luiza-maccarone", categoria: "F", idTime: 8, nome: 'Anna Luiza Maccarone', numero: 17, posicao: "oposto", foto: "Fotos-Atletas/barueri/anna.webp" },
            { id: "F-8-camilly-salome", categoria: "F", idTime: 8, nome: 'Camilly Salomé', numero: 10, posicao: "ponteiro", foto: "Fotos-Atletas/barueri/camily.webp" },
            { id: "F-8-pietra-jukoski", categoria: "F", idTime: 8, nome: 'Pietra Jukoski', numero: 5, posicao: "ponteiro", foto: "Fotos-Atletas/barueri/pietra.webp" },
            { id: "F-8-gabrielle-eduarda", categoria: "F", idTime: 8, nome: 'Gabrielle Eduarda', numero: 8, posicao: "ponteiro", foto: "Fotos-Atletas/barueri/gabi.webp" },
            { id: "F-8-sabrina-vitoria-sassa", categoria: "F", idTime: 8, nome: 'Sassá', numero: 11, posicao: "ponteiro", foto: "Fotos-Atletas/barueri/sassa.webp" },
            { id: "F-8-thays-oliveira", categoria: "F", idTime: 8, nome: 'Thays Oliveira', numero: 20, posicao: "central", foto: "Fotos-Atletas/barueri/thays.webp" },
            { id: "F-8-geovana-freitas", categoria: "F", idTime: 8, nome: 'Geovana Freitas', numero: 15, posicao: "central", foto: "Fotos-Atletas/barueri/geo.webp" },
            { id: "F-8-thaina-kiarele", categoria: "F", idTime: 8, nome: 'Thaina Kiarele', numero: 9, posicao: "central", foto: "Fotos-Atletas/barueri/thaina.webp" },
            { id: "F-8-ana-luisa-bento", categoria: "F", idTime: 8, nome: 'Ana Bento', numero: 3, posicao: "libero", foto: "Fotos-Atletas/barueri/ana-bento.webp" },
            { id: "F-8-sophia-da-cunha-dantas", categoria: "F", idTime: 8, nome: 'Soso Dantas', numero: 12, posicao: "libero", foto: "Fotos-Atletas/barueri/soso.webp" },
        ],
        9: [ // E.C. Pinheiros
            { id: "F-9-ju-carrijo", categoria: "F", idTime: 9, nome: 'Ju Carrijo', numero: 8, posicao: "levantador", foto: "Fotos-Atletas/pinheiros/ju-carrijo.webp" },
            { id: "F-9-maria-clara", categoria: "F", idTime: 9, nome: 'Maria Clara', numero: 3, posicao: "levantador", foto: "Fotos-Atletas/pinheiros/maria.webp" },
            { id: "F-9-madu-lima", categoria: "F", idTime: 9, nome: 'Madu Lima', numero: 4, posicao: "levantador", foto: "Fotos-Atletas/pinheiros/madu.webp" },
            { id: "F-9-camila-maluf", categoria: "F", idTime: 9, nome: 'Camila Maluf', numero: 5, posicao: "oposto", foto: "Fotos-Atletas/pinheiros/maluf.webp" },
            { id: "F-9-afedo-manyang", categoria: "F", idTime: 9, nome: 'Afedo Manyang', numero: 19, posicao: "oposto", foto: "Fotos-Atletas/pinheiros/afedo.webp" },
            { id: "F-9-talia-costa", categoria: "F", idTime: 9, nome: 'Talia Costa', numero: 10, posicao: "ponteiro", foto: "Fotos-Atletas/pinheiros/talia.webp" },
            { id: "F-9-flavia-lisboa", categoria: "F", idTime: 9, nome: 'Flávia Lisboa', numero: 7, posicao: "ponteiro", foto: "Fotos-Atletas/pinheiros/flavia.webp" },
            { id: "F-9-sabrina-groth", categoria: "F", idTime: 9, nome: 'Sabrina Groth', numero: 18, posicao: "ponteiro", foto: "Fotos-Atletas/pinheiros/sabrina.webp" },
            { id: "F-9-fernanda-rangel", categoria: "F", idTime: 9, nome: 'Fernanda Rangel', numero: 16, posicao: "ponteiro", foto: "Fotos-Atletas/pinheiros/fernanda.jpeg" },
            { id: "F-9-andressa-gelenski", categoria: "F", idTime: 9, nome: 'Andressa Gelenski', numero: 11, posicao: "central", foto: "Fotos-Atletas/pinheiros/andressa.webp" },
            { id: "F-9-luana-kuskowski", categoria: "F", idTime: 9, nome: 'Luana Kuskowski', numero: 20, posicao: "central", foto: "Fotos-Atletas/pinheiros/luana.webp" },
            { id: "F-9-adria-da-silva", categoria: "F", idTime: 9, nome: 'Adria da Silva', numero: 1, posicao: "central", foto: "Fotos-Atletas/pinheiros/adria.webp" },
            { id: "F-9-mariana-medeiros", categoria: "F", idTime: 9, nome: 'Mariana Medeiros', numero: 13, posicao: "central", foto: "Fotos-Atletas/pinheiros/mari.webp" },
            { id: "F-9-gabriela-valenga", categoria: "F", idTime: 9, nome: 'Gabriela Valenga', numero: 17, posicao: "libero", foto: "Fotos-Atletas/pinheiros/bibi.webp" },
            { id: "F-9-audren-mendonca", categoria: "F", idTime: 9, nome: 'Audren Rose', numero: 12, posicao: "libero", foto: "Fotos-Atletas/pinheiros/audren.webp" },
            { id: "F-9-paola-villegas", categoria: "F", idTime: 9, nome: 'Paola Villegas', numero: 6, posicao: "libero", foto: "Fotos-Atletas/pinheiros/villegas.webp" }
        ],
        10: [ // Londrina Sancor Seguros Vôlei
            { id: "F-10-bruninha", categoria: "F", idTime: 10, nome: 'Bruninha', numero: 2, posicao: "levantador", foto: "Fotos-Atletas/sancor/bruninha.webp" },
            { id: "F-10-mikaella", categoria: "F", idTime: 10, nome: 'Mikaella', numero: 14, posicao: "levantador", foto: "Fotos-Atletas/sancor/mikaella.webp" },
            { id: "F-10-daniela-cechetto", categoria: "F", idTime: 10, nome: 'Daniela Cechetto', numero: 5, posicao: "oposto", foto: "Fotos-Atletas/sancor/daniela-cechetto.webp" },
            { id: "F-10-carol-grossi", categoria: "F", idTime: 10, nome: 'Carol Grossi', numero: 15, posicao: "oposto", foto: "Fotos-Atletas/sancor/carol-grossi.webp" },
            { id: "F-10-vitoria-parise", categoria: "F", idTime: 10, nome: 'Vitória Parise', numero: 8, posicao: "ponteiro", foto: "Fotos-Atletas/sancor/vitoria-parise.webp" },
            { id: "F-10-luiza-vicente", categoria: "F", idTime: 10, nome: 'Luiza Vicente', numero: 9, posicao: "ponteiro", foto: "Fotos-Atletas/sancor/luiza-vicente.webp" },
            { id: "F-10-kyra-holt", categoria: "F", idTime: 10, nome: 'Kyra Holt', numero: 20, posicao: "ponteiro", foto: "Fotos-Atletas/sancor/kyra-holt.webp" },
            { id: "F-10-karol-tormena", categoria: "F", idTime: 10, nome: 'Karol Tormena', numero: 21, posicao: "ponteiro", foto: "Fotos-Atletas/sancor/karol-tormena.webp" },
            { id: "F-10-gabi-candido", categoria: "F", idTime: 10, nome: 'Gabi Cândido', numero: 6, posicao: "ponteiro", foto: "Fotos-Atletas/sancor/gabi-candido.webp" },
            { id: "F-10-katryne-rodrigues", categoria: "F", idTime: 10, nome: 'Katryne Rodrigues', numero: 16, posicao: "central", foto: "Fotos-Atletas/sancor/katryne-rodrigues.webp" },
            { id: "F-10-rebeca-camile", categoria: "F", idTime: 10, nome: 'Rebeca Camile', numero: 18, posicao: "central", foto: "Fotos-Atletas/sancor/rebeca-camile.webp" },
            { id: "F-10-jussara", categoria: "F", idTime: 10, nome: 'Jussara', numero: 4, posicao: "central", foto: "Fotos-Atletas/sancor/jussara.png" },
            { id: "F-10-ana-marcelin", categoria: "F", idTime: 10, nome: 'Ana Marcelin', numero: 10, posicao: "central", foto: "Fotos-Atletas/sancor/ana-marcelin.webp" },
            { id: "F-10-leticia-gomes", categoria: "F", idTime: 10, nome: 'Letícia Gomes', numero: 12, posicao: "libero", foto: "Fotos-Atletas/sancor/leticia-gomes.webp" },
            { id: "F-10-anielly", categoria: "F", idTime: 10, nome: 'Anielly', numero: 1, posicao: "libero", foto: "Fotos-Atletas/sancor/anielly.webp" },
        ],
        11: [ // Sesc RJ Flamengo
            { id: "F-11-giovana", categoria: "F", idTime: 11, nome: 'Giovana', numero: 20, posicao: "levantador", foto: "Fotos-Atletas/flamengo/giovana.png" },
            { id: "F-11-vivian", categoria: "F", idTime: 11, nome: 'Vívian', numero: 1, posicao: "levantador", foto: "Fotos-Atletas/flamengo/vivian.png" },
            { id: "F-11-tainara", categoria: "F", idTime: 11, nome: 'Tainara', numero: 10, posicao: "oposto", foto: "Fotos-Atletas/flamengo/tainara.png" },
            { id: "F-11-jaque-schmitz", categoria: "F", idTime: 11, nome: 'Jaque Schmitz', numero: 5, posicao: "oposto", foto: "Fotos-Atletas/flamengo/jaque.png" },
            { id: "F-11-simone-lee", categoria: "F", idTime: 11, nome: 'Simone Lee', numero: 2, posicao: "ponteiro", foto: "Fotos-Atletas/flamengo/simone-lee.png" },
            { id: "F-11-ariele", categoria: "F", idTime: 11, nome: 'Ariele', numero: 8, posicao: "ponteiro", foto: "Fotos-Atletas/flamengo/ariele.png" },
            { id: "F-11-karina", categoria: "F", idTime: 11, nome: 'Karina', numero: 11, posicao: "ponteiro", foto: "Fotos-Atletas/flamengo/karina.png" },
            { id: "F-11-mikaela", categoria: "F", idTime: 11, nome: 'Mikaela', numero: 14, posicao: "ponteiro", foto: "Fotos-Atletas/flamengo/mikaela.png" },
            { id: "F-11-lorena", categoria: "F", idTime: 11, nome: 'Lorena', numero: 7, posicao: "central", foto: "Fotos-Atletas/flamengo/lorena.png" },
            { id: "F-11-juju", categoria: "F", idTime: 11, nome: 'Juju Gandra', numero: 4, posicao: "central", foto: "Fotos-Atletas/flamengo/juju.png" },
            { id: "F-11-masa-kirov", categoria: "F", idTime: 11, nome: 'Maša Kirov', numero: 16, posicao: "central", foto: "Fotos-Atletas/flamengo/kirov.png" },
            { id: "F-11-minja-osmajic", categoria: "F", idTime: 11, nome: 'Minja Osmajić', numero: 3, posicao: "central", foto: "Fotos-Atletas/flamengo/minja.png" },
            { id: "F-11-bia-paranhos", categoria: "F", idTime: 11, nome: 'Bia Paranhos', numero: 13, posicao: "central", foto: "Fotos-Atletas/flamengo/bia-paranhos.png" },
            { id: "F-11-lais", categoria: "F", idTime: 11, nome: 'Laís', numero: 22, posicao: "libero", foto: "Fotos-Atletas/flamengo/lais.png" },
            { id: "F-11-victoria-stadler", categoria: "F", idTime: 11, nome: 'Victoria Stadler', numero: 21, posicao: "libero", foto: "Fotos-Atletas/flamengo/victoria-stadler.png" },
        ],
        12: [ // Sesi Vôlei Bauru
            { id: "F-12-amanda-mutuano", categoria: "F", idTime: 12, nome: 'Amanda Mutuano', numero: 15, posicao: "levantador", foto: "Fotos-Atletas/sesi/amanda.webp" },
            { id: "F-12-claudinha", categoria: "F", idTime: 12, nome: 'Claudinha', numero: 4, posicao: "levantador", foto: "Fotos-Atletas/sesi/claudinha.webp" },
            { id: "F-12-dani-lins", categoria: "F", idTime: 12, nome: 'Dani Lins', numero: 3, posicao: "levantador", foto: "Fotos-Atletas/sesi/dani-lins.webp" },
            { id: "F-12-bruna-moraes", categoria: "F", idTime: 12, nome: 'Bruna Moraes', numero: 16, posicao: "oposto", foto: "Fotos-Atletas/sesi/bruna-moraes.webp" },
            { id: "F-12-morgahn-fingall", categoria: "F", idTime: 12, nome: 'Morgahn Fingall', numero: 7, posicao: "oposto", foto: "Fotos-Atletas/sesi/fingall.webp" },
            { id: "F-12-isa-rocha", categoria: "F", idTime: 12, nome: 'Isa Rocha', numero: 8, posicao: "ponteiro", foto: "Fotos-Atletas/sesi/isa-rocha.webp" },
            { id: "F-12-giovanna", categoria: "F", idTime: 12, nome: 'Giovanna', numero: 12, posicao: "ponteiro", foto: "Fotos-Atletas/sesi/giovanna.webp" },
            { id: "F-12-maira", categoria: "F", idTime: 12, nome: 'Maira', numero: 14, posicao: "ponteiro", foto: "Fotos-Atletas/sesi/maira.webp" },
            { id: "F-12-roslandy-acosta", categoria: "F", idTime: 12, nome: 'Roslandy Acosta', numero: 17, posicao: "ponteiro", foto: "Fotos-Atletas/sesi/acosta.webp" },
            { id: "F-12-sofia-maldonado", categoria: "F", idTime: 12, nome: 'Sofia Maldonado', numero: 6, posicao: "ponteiro", foto: "Fotos-Atletas/sesi/sofia-maldonado.webp" },
            { id: "F-12-diana", categoria: "F", idTime: 12, nome: 'Diana', numero: 2, posicao: "central", foto: "Fotos-Atletas/sesi/diana.webp" },
            { id: "F-12-lara", categoria: "F", idTime: 12, nome: 'Lara', numero: 11, posicao: "central", foto: "Fotos-Atletas/sesi/lara.webp" },
            { id: "F-12-livia", categoria: "F", idTime: 12, nome: 'Lívia', numero: 9, posicao: "central", foto: "Fotos-Atletas/sesi/livia.webp" },
            { id: "F-12-milka", categoria: "F", idTime: 12, nome: 'Milka', numero: 1, posicao: "central", foto: "Fotos-Atletas/sesi/milka.webp" },
            { id: "F-12-leticia-lele", categoria: "F", idTime: 12, nome: 'Letícia (Lelê)', numero: 20, posicao: "libero", foto: "Fotos-Atletas/sesi/lele.webp" },
            { id: "F-12-sofia-will", categoria: "F", idTime: 12, nome: 'Sofia Will', numero: 19, posicao: "libero", foto: "Fotos-Atletas/sesi/sofia.webp" }
        ],
    },
    M: { // Superliga Masculina 2026/27
        1: [ // Azulim/Sicoob Aracoop/Monte Carmelo
            { id: "M-1-cesinha", categoria: "M", idTime: 1, nome: "Cesinha", numero: null, posicao: "levantador", foto: "" },
            { id: "M-1-anderson-filho", categoria: "M", idTime: 1, nome: "Anderson Filho", numero: null, posicao: "levantador", foto: "" },
            { id: "M-1-rodrigo-siuves", categoria: "M", idTime: 1, nome: "Rodrigo Siuves", numero: null, posicao: "levantador", foto: "" },
            { id: "M-1-hisham-ewais", categoria: "M", idTime: 1, nome: "Hisham Ewais", numero: null, posicao: "oposto", foto: "" },
            { id: "M-1-andre-oliveira", categoria: "M", idTime: 1, nome: "André Oliveira", numero: null, posicao: "oposto", foto: "" },
            { id: "M-1-gabriel-scheffer", categoria: "M", idTime: 1, nome: "Gabriel Scheffer", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-1-lucas-lima", categoria: "M", idTime: 1, nome: "Lucas Lima", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-1-igor-gabriel", categoria: "M", idTime: 1, nome: "Igor Gabriel", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-1-antony", categoria: "M", idTime: 1, nome: "Antony", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-1-joao-victor", categoria: "M", idTime: 1, nome: "João Victor", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-1-abenildes", categoria: "M", idTime: 1, nome: "Abenildes", numero: null, posicao: "central", foto: "" },
            { id: "M-1-harry-rivas", categoria: "M", idTime: 1, nome: "Harry Rivas", numero: null, posicao: "central", foto: "" },
            { id: "M-1-vinicius-silva", categoria: "M", idTime: 1, nome: "Vinicius Silva", numero: null, posicao: "central", foto: "" },
            { id: "M-1-guilherme-henrique", categoria: "M", idTime: 1, nome: "Guilherme Henrique", numero: null, posicao: "central", foto: "" },
            { id: "M-1-wallace-dos-santos", categoria: "M", idTime: 1, nome: "Wallace dos Santos", numero: null, posicao: "libero", foto: "" },
            { id: "M-1-filipe-baioco", categoria: "M", idTime: 1, nome: "Filipe Baioco", numero: null, posicao: "libero", foto: "" }
        ],

        2: [ // Itambé Minas
            { id: "M-2-thiago-veloso", categoria: "M", idTime: 2, nome: "Thiago Veloso", numero: null, posicao: "levantador", foto: "" },
            { id: "M-2-mateus-winck", categoria: "M", idTime: 2, nome: "Mateus Winck", numero: null, posicao: "levantador", foto: "" },
            { id: "M-2-henrique-veiga", categoria: "M", idTime: 2, nome: "Henrique Veiga", numero: null, posicao: "levantador", foto: "" },
            { id: "M-2-bryan-lucas", categoria: "M", idTime: 2, nome: "Bryan Lucas", numero: null, posicao: "oposto", foto: "" },
            { id: "M-2-jose-masso", categoria: "M", idTime: 2, nome: "José Masso", numero: null, posicao: "oposto", foto: "" },
            { id: "M-2-ricardo-lucarelli", categoria: "M", idTime: 2, nome: "Ricardo Lucarelli", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-2-henrique-honorato", categoria: "M", idTime: 2, nome: "Henrique Honorato", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-2-daniel-muniz", categoria: "M", idTime: 2, nome: "Daniel Muniz", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-2-joao-luzeiro", categoria: "M", idTime: 2, nome: "João Luzeiro", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-2-diogo-dos-anjos", categoria: "M", idTime: 2, nome: "Diogo dos Anjos", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-2-michel-saraiva", categoria: "M", idTime: 2, nome: "Michel Saraiva", numero: null, posicao: "central", foto: "" },
            { id: "M-2-geovane-kuhnen", categoria: "M", idTime: 2, nome: "Geovane Kuhnen", numero: null, posicao: "central", foto: "" },
            { id: "M-2-pietro-santos", categoria: "M", idTime: 2, nome: "Pietro Santos", numero: null, posicao: "central", foto: "" },
            { id: "M-2-matheus-dobkowski", categoria: "M", idTime: 2, nome: "Matheus Dobkowski", numero: null, posicao: "central", foto: "" },
            { id: "M-2-lucas-cambuim", categoria: "M", idTime: 2, nome: "Lucas Cambuim", numero: null, posicao: "central", foto: "" },
            { id: "M-2-maique-reis", categoria: "M", idTime: 2, nome: "Maique Reis", numero: null, posicao: "libero", foto: "" }
        ],

        3: [ // Montes Claros Vôlei
            { id: "M-3-rodrigo-ribeiro", categoria: "M", idTime: 3, nome: "Rodrigo Ribeiro", numero: null, posicao: "levantador", foto: "" },
            { id: "M-3-carlos-henrique", categoria: "M", idTime: 3, nome: "Carlos Henrique", numero: null, posicao: "levantador", foto: "" },
            { id: "M-3-paulo-victor", categoria: "M", idTime: 3, nome: "Paulo Victor", numero: null, posicao: "oposto", foto: "" },
            { id: "M-3-raje-alleyne", categoria: "M", idTime: 3, nome: "Rajé Alleyne", numero: null, posicao: "oposto", foto: "" },
            { id: "M-3-hiago-bueno", categoria: "M", idTime: 3, nome: "Hiago Bueno", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-3-gabriel-ostapechen", categoria: "M", idTime: 3, nome: "Gabriel Ostapechen", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-3-matias-provensi", categoria: "M", idTime: 3, nome: "Matias Provensi", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-3-dusan-bonacci", categoria: "M", idTime: 3, nome: "Dusan Bonacic", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-3-jo-carneiro", categoria: "M", idTime: 3, nome: "Jô Carneiro", numero: null, posicao: "central", foto: "" },
            { id: "M-3-lucas-fonseca", categoria: "M", idTime: 3, nome: "Lucas Fonseca", numero: null, posicao: "central", foto: "" },
            { id: "M-3-tiago-socher", categoria: "M", idTime: 3, nome: "Tiago Socher", numero: null, posicao: "central", foto: "" },
            { id: "M-3-babu", categoria: "M", idTime: 3, nome: "Babu", numero: null, posicao: "central", foto: "" },
            { id: "M-3-lukinhas", categoria: "M", idTime: 3, nome: "Lukinhas", numero: null, posicao: "libero", foto: "" },
            { id: "M-3-luiz-ricardo", categoria: "M", idTime: 3, nome: "Luiz Ricardo", numero: null, posicao: "libero", foto: "" }
        ],

        4: [ // Norde Vôlei
            { id: "M-4-rafael-cartaxo", categoria: "M", idTime: 4, nome: "Rafael Cartaxo", numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-bento", categoria: "M", idTime: 4, nome: "Bento", numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-italo", categoria: "M", idTime: 4, nome: "Ítalo", numero: null, posicao: "levantador", foto: "" },
            { id: "M-4-da-silva", categoria: "M", idTime: 4, nome: "Da Silva", numero: null, posicao: "oposto", foto: "" },
            { id: "M-4-breno-silva", categoria: "M", idTime: 4, nome: "Breno Silva", numero: null, posicao: "oposto", foto: "" },
            { id: "M-4-ygor-ceara", categoria: "M", idTime: 4, nome: "Ygor Ceará", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-rafa-bairros", categoria: "M", idTime: 4, nome: "Rafa Bairros", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-diego-evangelista", categoria: "M", idTime: 4, nome: "Diego Evangelista", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-emerson", categoria: "M", idTime: 4, nome: "Emerson", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-marcus", categoria: "M", idTime: 4, nome: "Marcus", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-4-pablo-bertolo", categoria: "M", idTime: 4, nome: "Pablo Bertolo", numero: null, posicao: "central", foto: "" },
            { id: "M-4-augusto-cauduro", categoria: "M", idTime: 4, nome: "Augusto Cauduro", numero: null, posicao: "central", foto: "" },
            { id: "M-4-lucas-salles", categoria: "M", idTime: 4, nome: "Lucas Salles", numero: null, posicao: "central", foto: "" },
            { id: "M-4-puron", categoria: "M", idTime: 4, nome: "Puron", numero: null, posicao: "central", foto: "" },
            { id: "M-4-bruno-bello", categoria: "M", idTime: 4, nome: "Bruno Bello", numero: null, posicao: "libero", foto: "" },
            { id: "M-4-henrique-melo", categoria: "M", idTime: 4, nome: "Henrique Melo", numero: null, posicao: "libero", foto: "" }
        ],

        5: [ // Praia Clube Uberlândia Vôlei
            { id: "M-5-rhesley", categoria: "M", idTime: 5, nome: "Rhesley", numero: null, posicao: "levantador", foto: "" },
            { id: "M-5-rafael-forster", categoria: "M", idTime: 5, nome: "Rafael Forster", numero: null, posicao: "levantador", foto: "" },
            { id: "M-5-lucas-rocha", categoria: "M", idTime: 5, nome: "Lucas Rocha", numero: null, posicao: "levantador", foto: "" },
            { id: "M-5-franco", categoria: "M", idTime: 5, nome: "Franco", numero: null, posicao: "oposto", foto: "" },
            { id: "M-5-wesleen", categoria: "M", idTime: 5, nome: "Wesleen", numero: null, posicao: "oposto", foto: "" },
            { id: "M-5-paulo-vinicios", categoria: "M", idTime: 5, nome: "Paulo Vinicios", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-5-lucas-loh", categoria: "M", idTime: 5, nome: "Lucas Lóh", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-5-ryan", categoria: "M", idTime: 5, nome: "Ryan", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-5-wilson", categoria: "M", idTime: 5, nome: "Wilson", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-5-joaquim", categoria: "M", idTime: 5, nome: "Joaquim", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-5-isac", categoria: "M", idTime: 5, nome: "Isac", numero: null, posicao: "central", foto: "" },
            { id: "M-5-wennder", categoria: "M", idTime: 5, nome: "Wennder", numero: null, posicao: "central", foto: "" },
            { id: "M-5-rhyan-wagner", categoria: "M", idTime: 5, nome: "Rhyan Wagner", numero: null, posicao: "central", foto: "" },
            { id: "M-5-guilherme-voss", categoria: "M", idTime: 5, nome: "Guilherme Voss", numero: null, posicao: "central", foto: "" },
            { id: "M-5-filipinho", categoria: "M", idTime: 5, nome: "Filipinho", numero: null, posicao: "libero", foto: "" }
        ],

        6: [ // Sada Cruzeiro
            { id: "M-6-matheus-brasilia", categoria: "M", idTime: 6, nome: "Matheus Brasília", numero: null, posicao: "levantador", foto: "" },
            { id: "M-6-gustavo-orlando", categoria: "M", idTime: 6, nome: "Gustavo Orlando", numero: null, posicao: "levantador", foto: "" },
            { id: "M-6-oppenkoski", categoria: "M", idTime: 6, nome: "Oppenkoski", numero: null, posicao: "oposto", foto: "" },
            { id: "M-6-wallace", categoria: "M", idTime: 6, nome: "Wallace", numero: null, posicao: "oposto", foto: "" },
            { id: "M-6-yoandy-leal", categoria: "M", idTime: 6, nome: "Yoandy Leal", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-6-rodriguinho", categoria: "M", idTime: 6, nome: "Rodriguinho", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-6-willian", categoria: "M", idTime: 6, nome: "Willian", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-6-armoa-morel", categoria: "M", idTime: 6, nome: "Armoa Morel", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-6-lucao", categoria: "M", idTime: 6, nome: "Lucão", numero: null, posicao: "central", foto: "" },
            { id: "M-6-otavio", categoria: "M", idTime: 6, nome: "Otávio", numero: null, posicao: "central", foto: "" },
            { id: "M-6-juan-velasco", categoria: "M", idTime: 6, nome: "Juan Velasco", numero: null, posicao: "central", foto: "" },
            { id: "M-6-ale-elias", categoria: "M", idTime: 6, nome: "Alê Elias", numero: null, posicao: "libero", foto: "" },
            { id: "M-6-arthur-lessa", categoria: "M", idTime: 6, nome: "Arthur Lessa", numero: null, posicao: "libero", foto: "" }
        ],

        7: [ // Saneago Goiás Vôlei
            { id: "M-7-eduardo-carisio", categoria: "M", idTime: 7, nome: "Eduardo Carísio", numero: 8, posicao: "levantador", foto: "" },
            { id: "M-7-mayron-rezende", categoria: "M", idTime: 7, nome: "Mayron Rezende", numero: 9, posicao: "levantador", foto: "" },
            { id: "M-7-geraldo-graciano", categoria: "M", idTime: 7, nome: "Geraldo Graciano", numero: 7, posicao: "oposto", foto: "" },
            { id: "M-7-andre-saliba", categoria: "M", idTime: 7, nome: "André Saliba", numero: 27, posicao: "oposto", foto: "" },
            { id: "M-7-eduardo-ayala", categoria: "M", idTime: 7, nome: "Eduardo Ayala", numero: 3, posicao: "ponteiro", foto: "" },
            { id: "M-7-rodrigo-leandro", categoria: "M", idTime: 7, nome: "Rodrigo Leandro", numero: 12, posicao: "ponteiro", foto: "" },
            { id: "M-7-batagim", categoria: "M", idTime: 7, nome: "Batagim", numero: 17, posicao: "ponteiro", foto: "" },
            { id: "M-7-felipi-ramme", categoria: "M", idTime: 7, nome: "Felipi Rammé", numero: 18, posicao: "ponteiro", foto: "" },
            { id: "M-7-marcos-valentim", categoria: "M", idTime: 7, nome: "Marcos Valentim", numero: 21, posicao: "ponteiro", foto: "" },
            { id: "M-7-bruno-amorim", categoria: "M", idTime: 7, nome: "Bruno Amorim", numero: 4, posicao: "central", foto: "" },
            { id: "M-7-edson-paixao", categoria: "M", idTime: 7, nome: "Edson Paixão", numero: 10, posicao: "central", foto: "" },
            { id: "M-7-gabriel-bertolini", categoria: "M", idTime: 7, nome: "Gabriel Bertolini", numero: 11, posicao: "central", foto: "" },
            { id: "M-7-bernardo-santos", categoria: "M", idTime: 7, nome: "Bernardo Santos", numero: 23, posicao: "central", foto: "" },
            { id: "M-7-matheus-santos", categoria: "M", idTime: 7, nome: "Matheus Santos", numero: 2, posicao: "libero", foto: "" }
        ],

        8: [ // Sesi Bauru
            { id: "M-8-mateus-bender", categoria: "M", idTime: 8, nome: "Mateus Bender", numero: null, posicao: "levantador", foto: "" },
            { id: "M-8-bruno-canhoto", categoria: "M", idTime: 8, nome: "Bruno Canhoto", numero: null, posicao: "levantador", foto: "" },
            { id: "M-8-samuel-neufeld", categoria: "M", idTime: 8, nome: "Samuel Neufeld", numero: null, posicao: "oposto", foto: "" },
            { id: "M-8-wagner-silva", categoria: "M", idTime: 8, nome: "Wagner Silva", numero: null, posicao: "oposto", foto: "" },
            { id: "M-8-guiga", categoria: "M", idTime: 8, nome: "Guiga", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-gabriel-vaccari", categoria: "M", idTime: 8, nome: "Gabriel Vaccari", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-gui-amorim", categoria: "M", idTime: 8, nome: "Gui Amorim", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-victor-hugo", categoria: "M", idTime: 8, nome: "Victor Hugo", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-pedro-marcon", categoria: "M", idTime: 8, nome: "Pedro Marcon", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-8-thiery", categoria: "M", idTime: 8, nome: "Thiery", numero: null, posicao: "central", foto: "" },
            { id: "M-8-barreto", categoria: "M", idTime: 8, nome: "Barreto", numero: null, posicao: "central", foto: "" },
            { id: "M-8-willian-pereira", categoria: "M", idTime: 8, nome: "Willian Pereira", numero: null, posicao: "central", foto: "" },
            { id: "M-8-pureza", categoria: "M", idTime: 8, nome: "Douglas Pureza", numero: null, posicao: "libero", foto: "" },
            { id: "M-8-henzo", categoria: "M", idTime: 8, nome: "Henzo", numero: null, posicao: "libero", foto: "" }
        ],

        9: [ // Sil Vôlei Guarulhos
            { id: "M-9-sandro-carvalho", categoria: "M", idTime: 9, nome: "Sandro Carvalho", numero: null, posicao: "levantador", foto: "" },
            { id: "M-9-dudu-faquin", categoria: "M", idTime: 9, nome: "Dudu Faquin", numero: null, posicao: "levantador", foto: "" },
            { id: "M-9-murillo-sa", categoria: "M", idTime: 9, nome: "Murillo Sá", numero: null, posicao: "levantador", foto: "" },
            { id: "M-9-michael-sanchez", categoria: "M", idTime: 9, nome: "Michael Sanchez", numero: null, posicao: "oposto", foto: "" },
            { id: "M-9-kauan-jaques", categoria: "M", idTime: 9, nome: "Kauan Jaques", numero: null, posicao: "oposto", foto: "" },
            { id: "M-9-daniel-felipe", categoria: "M", idTime: 9, nome: "Daniel Felipe", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-9-thiago-vaccari", categoria: "M", idTime: 9, nome: "Thiago Vaccari", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-9-felipe-parra", categoria: "M", idTime: 9, nome: "Felipe Parra", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-9-gabriel-machado", categoria: "M", idTime: 9, nome: "Gabriel Machado", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-9-eduardo-guedes", categoria: "M", idTime: 9, nome: "Eduardo Guedes", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-9-pedro-henrique", categoria: "M", idTime: 9, nome: "Pedro Henrique", numero: null, posicao: "central", foto: "" },
            { id: "M-9-henrique-guedes", categoria: "M", idTime: 9, nome: "Henrique Guedes", numero: null, posicao: "central", foto: "" },
            { id: "M-9-thales-falcao", categoria: "M", idTime: 9, nome: "Thales Falcão", numero: null, posicao: "central", foto: "" },
            { id: "M-9-artur-nunes", categoria: "M", idTime: 9, nome: "Artur Nunes", numero: null, posicao: "central", foto: "" },
            { id: "M-9-joao-centola", categoria: "M", idTime: 9, nome: "João Centola", numero: null, posicao: "libero", foto: "" },
            { id: "M-9-lucas-oishi", categoria: "M", idTime: 9, nome: "Lucas Oishi", numero: null, posicao: "libero", foto: "" }
        ],

        10: [ // Suzano Vôlei
            { id: "M-10-gabriel-bieler", categoria: "M", idTime: 10, nome: "Gabriel Bieler", numero: null, posicao: "levantador", foto: "" },
            { id: "M-10-matheus-bento", categoria: "M", idTime: 10, nome: "Matheus Bento", numero: null, posicao: "levantador", foto: "" },
            { id: "M-10-sabino", categoria: "M", idTime: 10, nome: "Sabino", numero: null, posicao: "oposto", foto: "" },
            { id: "M-10-paulao", categoria: "M", idTime: 10, nome: "Paulão", numero: null, posicao: "oposto", foto: "" },
            { id: "M-10-mauricio-borges", categoria: "M", idTime: 10, nome: "Maurício Borges", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-10-robert", categoria: "M", idTime: 10, nome: "Robert", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-10-vitor-baesso", categoria: "M", idTime: 10, nome: "Vitor Baesso", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-10-luiz-andrada", categoria: "M", idTime: 10, nome: "Luiz Andrada", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-10-leo-andrade", categoria: "M", idTime: 10, nome: "Leo Andrade", numero: null, posicao: "central", foto: "" },
            { id: "M-10-riad", categoria: "M", idTime: 10, nome: "Riad", numero: null, posicao: "central", foto: "" },
            { id: "M-10-alvaro", categoria: "M", idTime: 10, nome: "Álvaro", numero: null, posicao: "central", foto: "" },
            { id: "M-10-lucas-franca", categoria: "M", idTime: 10, nome: "Lucas França", numero: null, posicao: "central", foto: "" },
            { id: "M-10-lucas-perrut", categoria: "M", idTime: 10, nome: "Lucas Perrut", numero: null, posicao: "central", foto: "" },
            { id: "M-10-lukinha", categoria: "M", idTime: 10, nome: "Lukinha", numero: null, posicao: "libero", foto: "" },
            { id: "M-10-taichi-hangai", categoria: "M", idTime: 10, nome: "Taichi Hangai", numero: null, posicao: "libero", foto: "" }
        ],

        11: [ // Viapol Vôlei São José
            { id: "M-11-gustavo-orlando", categoria: "M", idTime: 11, nome: "Gustavo Orlando", numero: null, posicao: "levantador", foto: "" },
            { id: "M-11-juan-esteban", categoria: "M", idTime: 11, nome: "Juan Esteban", numero: null, posicao: "levantador", foto: "" },
            { id: "M-11-celso", categoria: "M", idTime: 11, nome: "Celso", numero: null, posicao: "levantador", foto: "" },
            { id: "M-11-davy-moraes", categoria: "M", idTime: 11, nome: "Davy Moraes", numero: null, posicao: "oposto", foto: "" },
            { id: "M-11-maicol-ortiz", categoria: "M", idTime: 11, nome: "Maicol Ortiz", numero: null, posicao: "oposto", foto: "" },
            { id: "M-11-guilherme-narciso", categoria: "M", idTime: 11, nome: "Guilherme Narciso", numero: null, posicao: "oposto", foto: "" },
            { id: "M-11-thiago-ribeiro", categoria: "M", idTime: 11, nome: "Thiago Ribeiro", numero: null, posicao: "oposto", foto: "" },
            { id: "M-11-gabriel-pessoa", categoria: "M", idTime: 11, nome: "Gabriel Pessoa", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-11-matheus-celestino", categoria: "M", idTime: 11, nome: "Matheus Celestino", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-11-deivid-mota", categoria: "M", idTime: 11, nome: "Deivid Mota", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-11-sergio-camargo", categoria: "M", idTime: 11, nome: "Sérgio Camargo", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-11-bernardo-chassot", categoria: "M", idTime: 11, nome: "Bernardo Chassot", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-11-felipe-brito", categoria: "M", idTime: 11, nome: "Felipe Brito", numero: null, posicao: "central", foto: "" },
            { id: "M-11-matheus-pedrosa", categoria: "M", idTime: 11, nome: "Matheus Pedrosa", numero: null, posicao: "central", foto: "" },
            { id: "M-11-johan-marengoni", categoria: "M", idTime: 11, nome: "Johan Marengoni", numero: null, posicao: "central", foto: "" },
            { id: "M-11-bruno-biella", categoria: "M", idTime: 11, nome: "Bruno Biella", numero: null, posicao: "central", foto: "" },
            { id: "M-11-gregori-gato", categoria: "M", idTime: 11, nome: "Gregori Gato", numero: null, posicao: "central", foto: "" },
            { id: "M-11-rogerinho", categoria: "M", idTime: 11, nome: "Rogerinho", numero: null, posicao: "libero", foto: "" },
            { id: "M-11-vinicius-chub", categoria: "M", idTime: 11, nome: "Vinicius Chub", numero: null, posicao: "libero", foto: "" }
        ],

        12: [ // Vôlei Renata
            { id: "M-12-bruninho", categoria: "M", idTime: 12, nome: "Bruninho", numero: null, posicao: "levantador", foto: "" },
            { id: "M-12-cristiano-torelli", categoria: "M", idTime: 12, nome: "Cristiano Torelli", numero: null, posicao: "levantador", foto: "" },
            { id: "M-12-bruno-lima", categoria: "M", idTime: 12, nome: "Bruno Lima", numero: null, posicao: "oposto", foto: "" },
            { id: "M-12-acerola", categoria: "M", idTime: 12, nome: "Acerola", numero: null, posicao: "oposto", foto: "" },
            { id: "M-12-douglas-souza", categoria: "M", idTime: 12, nome: "Douglas Souza", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-12-jan-martinez", categoria: "M", idTime: 12, nome: "Jan Martínez", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-12-marcus-coelho", categoria: "M", idTime: 12, nome: "Marcus Coelho", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-12-vinicius-henrique", categoria: "M", idTime: 12, nome: "Vinícius Henrique", numero: null, posicao: "ponteiro", foto: "" },
            { id: "M-12-matheus-pinta", categoria: "M", idTime: 12, nome: "Matheus Pinta", numero: null, posicao: "central", foto: "" },
            { id: "M-12-eder", categoria: "M", idTime: 12, nome: "Éder", numero: null, posicao: "central", foto: "" },
            { id: "M-12-witallo", categoria: "M", idTime: 12, nome: "Witallo", numero: null, posicao: "central", foto: "" },
            { id: "M-12-yan-patrick", categoria: "M", idTime: 12, nome: "Yan Patrick", numero: null, posicao: "central", foto: "" },
            { id: "M-12-pedrinho", categoria: "M", idTime: 12, nome: "Pedrinho", numero: null, posicao: "libero", foto: "" },
            { id: "M-12-matheus-bandini", categoria: "M", idTime: 12, nome: "Matheus Bandini", numero: null, posicao: "libero", foto: "" }
        ]
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
        // O código é a fonte-base; o navegador/banco só completam o que o código não tem. Sem duplicar IDs.
        const mesclados = new Map(ATLETAS_BASE.map((a) => [a.id, { ...a }]));
        const idsAntigosDaSelecao = new Set([
            "F-6-thaisa", "F-6-luzia", "F-6-nyeme", "F-11-tainara", "F-11-vivian",
            "F-11-lorena", "F-12-diana", "F-7-marcelle", "F-4-sabrina",
            "M-4-lucarelli", "M-4-maique", "M-4-honorato", "M-4-bryan",
            "M-9-brasilia", "M-1-pureza", "M-2-matheus-pinta"
        ]);
        const normalizarNome = (nome) => semAcento(String(nome || "").trim()).replace(/\s+/g, " ");
        const baseDoId = new Map(ATLETAS_BASE.map((a) => [a.id, a]));
        (local.length ? local : (DADOS_PUBLICOS[chave] || [])).forEach((a) => {
            // Remove IDs da lista antiga de destaques da Seleção.
            if (idsAntigosDaSelecao.has(a.id)) return;
            // Acha a atleta no código: primeiro pelo id; se não achar (registro antigo com
            // outro id), pelo time + nome.
            const base = baseDoId.get(a.id) || ATLETAS_BASE.find((b) =>
                String(b.categoria) === String(a.categoria) &&
                String(b.idTime) === String(a.idTime) &&
                normalizarNome(b.nome) === normalizarNome(a.nome));
            if (base) {
                // O CÓDIGO (este arquivo) manda: se você mudou o nome, o número, a posição ou a foto
                // aqui, vale o que está aqui. O que veio do navegador/banco só preenche o que o
                // código deixou vazio (ex.: uma foto enviada pelo painel).
                mesclados.set(base.id, {
                    ...a, ...base,
                    numero: base.numero ?? a.numero ?? null,
                    posicao: base.posicao || a.posicao || "",
                    foto: base.foto || a.foto || ""
                });
            } else {
                mesclados.set(a.id, { ...a });   // atleta que só existe no banco/navegador
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