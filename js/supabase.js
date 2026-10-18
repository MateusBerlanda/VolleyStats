"use strict";
// Conexão do VolleyStats com o Supabase (banco de dados na nuvem).
// Precisa ser carregado DEPOIS do atletas.js e ANTES do admin.js.
// O painel admin continua funcionando no navegador (rápido, mesmo sem internet);
// cada alteração entra numa FILA e é enviada ao Supabase assim que possível.

// ===== CONFIGURAÇÃO =====
// Estes dois valores são PÚBLICOS por natureza: quem protege os dados são as regras (RLS)
// criadas no Supabase. Nunca coloque aqui a chave "secret" / "service_role".
const SUPABASE_URL = "https://fwaknudyberjeahzanbb.supabase.co";
const SUPABASE_CHAVE_PUBLICA = "sb_publishable_I298Py497uwua9-g2CaTwA_SphrNdYK";

// "nuvem" é o cliente que conversa com o Supabase (a biblioteca vem do CDN, no admin.html)
const nuvem = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA)
    : null;

const K_FILA = "volleyStats_fila_nuvem";     // alterações ainda não enviadas
const K_NUVEM_OK = "volleyStats_nuvem_ok";   // marca que este navegador já sincronizou alguma vez
let nuvemUltimoErro = "";

// ===== CONVERSÃO DE DADOS =====
// No código usamos camelCase (idTime); no banco usamos snake_case (id_time).
const textoOuNulo = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

const atletaParaLinha = (a) => ({
    id: String(a.id), categoria: a.categoria, id_time: Number(a.idTime), nome: a.nome,
    numero: textoOuNulo(a.numero), posicao: a.posicao || null, foto: a.foto || ""
});
const linhaParaAtleta = (r) => ({
    id: r.id, categoria: r.categoria, idTime: r.id_time, nome: r.nome,
    numero: r.numero, posicao: r.posicao || "", foto: r.foto || ""
});

const jogadaParaLinha = (j) => ({
    id: String(j.id), id_jogo: Number(j.idJogo), id_atleta: String(j.idAtleta), tipo: j.tipo, ts: Number(j.ts)
});
const linhaParaJogada = (r) => ({
    id: r.id, idJogo: Number(r.id_jogo), idAtleta: r.id_atleta, tipo: r.tipo, ts: Number(r.ts)
});

const jogoParaLinha = (j) => ({
    id_jogo: Number(j.idJogo), categoria: j.categoria, id_mandante: Number(j.idMandante),
    id_visitante: Number(j.idVisitante), sets_mandante: Number(j.setsMandante),
    sets_visitante: Number(j.setsVisitante), jogado: true,
    finalizado_em: j.finalizadoEm || new Date().toISOString()
});
const linhaParaJogo = (r) => ({
    idJogo: Number(r.id_jogo), categoria: r.categoria, idMandante: r.id_mandante,
    idVisitante: r.id_visitante, setsMandante: r.sets_mandante, setsVisitante: r.sets_visitante,
    jogado: r.jogado, finalizadoEm: r.finalizado_em
});

// ===== LOGIN =====
async function nuvemUsuario() {
    if (!nuvem) return null;
    const { data } = await nuvem.auth.getSession();
    return data.session ? data.session.user : null;
}

async function nuvemEntrar(email, senha) {
    const { error } = await nuvem.auth.signInWithPassword({ email, password: senha });
    return error ? error.message : null;
}

async function nuvemSair() {
    await nuvem.auth.signOut();
}

// ===== ENVIO EM LOTES (upsert = insere as novas e atualiza as existentes, sem duplicar) =====
async function enviarEmLotes(tabela, linhas, colunaChave, tamanhoLote) {
    for (let i = 0; i < linhas.length; i += tamanhoLote) {
        const { error } = await nuvem.from(tabela).upsert(linhas.slice(i, i + tamanhoLote), { onConflict: colunaChave });
        if (error) return error.message;
    }
    return null;
}

// Envia o elenco (código + edições deste navegador). Algumas fotos são pesadas: lotes pequenos.
async function nuvemEnviarElenco() {
    const porId = new Map(ler(K_ATLETAS).map((a) => [String(a.id), atletaParaLinha(a)]));   // sem ids repetidos
    const linhas = [...porId.values()];
    const erro = await enviarEmLotes("atletas", linhas, "id", 50);
    return erro ? { erro } : { enviadas: linhas.length };
}

// Envia TUDO o que este navegador tem (atletas, jogadas e resultados). A ordem importa:
// as atletas precisam existir antes das jogadas que apontam para elas.
async function nuvemEnviarTudo() {
    if (!(await nuvemUsuario())) return { erro: "Entre na conta de administrador primeiro." };
    const elenco = await nuvemEnviarElenco();
    if (elenco.erro) return elenco;
    const jogadas = ler(K_JOGADAS).map(jogadaParaLinha);
    const jogos = ler(K_JOGOS).filter((j) => j.jogado).map(jogoParaLinha);
    let erro = await enviarEmLotes("jogadas", jogadas, "id", 500);
    if (!erro) erro = await enviarEmLotes("jogos", jogos, "id_jogo", 500);
    return erro ? { erro } : { jogadas: jogadas.length, jogos: jogos.length };
}

// ===== FILA DE ALTERAÇÕES =====
// Cada ação do admin vira um item: { t: tipo, d: dados } ou { t: "...-del", id }.
// Tipos: jogada, jogada-del, jogo, jogo-del, atleta, atleta-del.
const filaLer = () => { try { return JSON.parse(localStorage.getItem(K_FILA)) || []; } catch (e) { return []; } };
const filaGravar = (fila) => { try { localStorage.setItem(K_FILA, JSON.stringify(fila)); } catch (e) { /* ignora */ } };
const nuvemPendentes = () => filaLer().length;
const avisarStatus = () => { if (typeof document.dispatchEvent === "function") document.dispatchEvent(new CustomEvent("nuvem-status")); };

function nuvemEnfileirar(op) {
    if (!nuvem) return;
    const fila = filaLer();
    fila.push(op);
    filaGravar(fila);
    avisarStatus();
    nuvemProcessarFila();
}

// Executa um item. Devolve o erro (ou null se deu certo).
async function executarOp(op) {
    const tabela = { jogada: "jogadas", jogo: "jogos", atleta: "atletas" }[op.t.split("-")[0]];
    if (op.t.endsWith("-del")) {
        const { error } = await nuvem.from(tabela).delete().eq(op.t === "jogo-del" ? "id_jogo" : "id", op.id);
        return error;
    }
    const chave = op.t === "jogo" ? "id_jogo" : "id";
    let { error } = await nuvem.from(tabela).upsert(op.d, { onConflict: chave });
    // Jogada de uma atleta que ainda não está no banco (erro 23503): envia a atleta e tenta de novo
    if (error && error.code === "23503" && op.t === "jogada") {
        const atleta = ler(K_ATLETAS).find((a) => String(a.id) === op.d.id_atleta);
        if (atleta) {
            await nuvem.from("atletas").upsert(atletaParaLinha(atleta), { onConflict: "id" });
            ({ error } = await nuvem.from(tabela).upsert(op.d, { onConflict: chave }));
        }
    }
    return error;
}

let processandoFila = false;
async function nuvemProcessarFila() {
    if (!nuvem || processandoFila) return;
    processandoFila = true;
    try {
        if (!(await nuvemUsuario())) { nuvemUltimoErro = filaLer().length ? "entre na conta para enviar" : ""; return; }
        for (let fila = filaLer(); fila.length; fila = filaLer()) {
            const erro = await executarOp(fila[0]);
            if (erro) { nuvemUltimoErro = erro.message; console.error("Falha ao sincronizar:", erro); return; }
            fila.shift();
            filaGravar(fila);
            nuvemUltimoErro = "";
            avisarStatus();
        }
    } catch (e) {
        nuvemUltimoErro = e.message;
    } finally {
        processandoFila = false;
        avisarStatus();
        // Entrou algo na fila no instante em que terminávamos: processa de novo
        if (filaLer().length && !nuvemUltimoErro) setTimeout(nuvemProcessarFila, 0);
    }
}
window.addEventListener("online", nuvemProcessarFila);   // voltou a internet: tenta de novo

// ===== LEITURA DO BANCO =====
// O Supabase devolve no máximo 1000 linhas por pedido, então lemos em páginas.
async function baixarTabela(nome, colunasOrdem) {
    const tudo = [], TAM = 1000;
    for (let ini = 0; ; ini += TAM) {
        let q = nuvem.from(nome).select("*");
        colunasOrdem.forEach((c) => { q = q.order(c, { ascending: true }); });
        const { data, error } = await q.range(ini, ini + TAM - 1);
        if (error) throw new Error(error.message);
        tudo.push(...data);
        if (data.length < TAM) break;
    }
    return tudo;
}

async function nuvemBaixarTudo() {
    try {
        const [a, j, g] = await Promise.all([
            baixarTabela("atletas", ["id"]),
            baixarTabela("jogadas", ["ts", "id"]),
            baixarTabela("jogos", ["id_jogo"])
        ]);
        return { atletas: a.map(linhaParaAtleta), jogadas: j.map(linhaParaJogada), jogos: g.map(linhaParaJogo) };
    } catch (e) {
        return { erro: e.message };
    }
}

async function nuvemContarAtletas() {
    const { count, error } = await nuvem.from("atletas").select("id", { count: "exact", head: true });
    return error ? null : count;
}

// ===== TELA (painel "Conta de administrador" do admin.html) =====
(function iniciarPainelNuvem() {
    const form = $("nuvem-form");
    if (!form) return;   // página sem o painel (ex.: index.html)

    const msg = (texto, ok = false) => {
        const el = $("nuvem-msg");
        el.textContent = texto;
        el.className = "nuvem-msg" + (ok ? " ok" : "");
    };

    function atualizarIndicador() {
        const n = nuvemPendentes(), el = $("nuvem-sync");
        if (!n) { el.textContent = "✔ Tudo sincronizado com o banco"; el.className = "nuvem-sync ok"; return; }
        el.textContent = `⏳ ${n} alteração(ões) aguardando envio` + (nuvemUltimoErro ? ` — ${nuvemUltimoErro}` : "");
        el.className = "nuvem-sync pend";
    }

    async function atualizarTela() {
        const usuario = await nuvemUsuario();
        $("nuvem-deslogado").hidden = !!usuario;
        $("nuvem-logado").hidden = !usuario;
        if (usuario) {
            $("nuvem-usuario").textContent = usuario.email;
            const total = await nuvemContarAtletas();
            $("nuvem-total").textContent = total === null ? "não foi possível consultar" : `${total} atleta(s) no banco`;
        }
        atualizarIndicador();
    }

    if (!nuvem) {
        msg("Não foi possível carregar o Supabase (confira a internet e o <script> do CDN no admin.html).");
        form.querySelector("button").disabled = true;
        return;
    }

    document.addEventListener("nuvem-status", atualizarIndicador);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg("Entrando…");
        const erro = await nuvemEntrar($("nuvem-email").value.trim(), $("nuvem-senha").value);
        $("nuvem-senha").value = "";
        if (erro) return msg("Não foi possível entrar: " + erro);
        msg("");
        await atualizarTela();
        document.dispatchEvent(new CustomEvent("nuvem-sincronizar"));   // o admin.js escuta e baixa os dados
    });

    $("btn-nuvem-sair").addEventListener("click", async () => {
        await nuvemSair();
        msg("Você saiu.", true);
        atualizarTela();
    });

    $("btn-nuvem-sync").addEventListener("click", () => {
        msg("Sincronizando…", true);
        document.dispatchEvent(new CustomEvent("nuvem-sincronizar"));
    });

    $("btn-enviar-elenco").addEventListener("click", async () => {
        if (!confirm("Enviar o elenco deste navegador para o Supabase? Atletas já existentes serão atualizadas.")) return;
        msg("Enviando…");
        const r = await nuvemEnviarElenco();
        if (r.erro) return msg("Erro ao enviar: " + r.erro);
        msg(`Pronto! ${r.enviadas} atletas enviadas.`, true);
        atualizarTela();
    });

    atualizarTela();
})();
