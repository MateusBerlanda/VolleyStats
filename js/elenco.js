"use strict";
// Painel admin. Depende de teams.js e atletas.js (carregados antes no HTML).

// ===== ESTADO =====
let categoria = "F";
let lado = "casa";           // "casa" (mandante) ou "fora" (visitante)
let idJogo = null;
let rodadaAtiva = "";        // ex.: "T-1" = Turno, rodada 1
let avisoPlacar = "";        // mensagem curta sob o placar (set/jogo encerrado)
let timeElenco = 1;          // time mostrado na seção Elenco
const atletas = ATLETAS;       // cadastrados no elencos.js
let jogadas = ler(K_JOGADAS);

// Calendário do teams.js + placar de cada jogo (calculado das jogadas)
function carregarJogos() { return montarJogos(); }
const jogos = carregarJogos();

// ===== AUXILIARES =====
const timesDaCategoria = (cat = categoria) => cat === "F" ? tabelaSuperligaFeminina : tabelaSuperligaMasculina;
const jogosDaCategoria = () => jogos.filter((j) => j.categoria === categoria);
const jogosDaRodada = () => jogosDaCategoria().filter((j) => chaveRodada(j) === rodadaAtiva);
const jogoAtual = () => jogos.find((j) => j.idJogo === idJogo);
const elencoDe = (idTime) => ordenarElenco(atletas.filter((a) => a.categoria === categoria && a.idTime === idTime));

function timeAtual() {
    const j = jogoAtual();
    if (!j) return null;
    return timesDaCategoria().find((t) => t.id === (lado === "casa" ? j.idMandante : j.idVisitante)) || null;
}

const contar = (idAtleta, tipo, jogo) =>
    jogadas.filter((j) => j.idAtleta === idAtleta && j.tipo === tipo && (jogo == null || j.idJogo === jogo)).length;
const tiposDePonto = STATS.filter((s) => s.tipo === "ponto").map((s) => s.chave);
const pontos = (idAtleta, jogo) => tiposDePonto.reduce((soma, tipo) => soma + contar(idAtleta, tipo, jogo), 0);
const erros = (idAtleta, jogo) => contar(idAtleta, "erro", jogo);

// Placar do jogo aberto, calculado das jogadas (ver calcularPlacar no atletas.js)
const placarAtual = () => {
    const j = jogoAtual();
    return j ? calcularPlacar(j, jogadas.filter((x) => x.idJogo === idJogo), new Map(atletas.map((a) => [a.id, a.idTime]))) : null;
};
const nomeDoLado = (l) => {
    const j = jogoAtual();
    const t = j && timesDaCategoria().find((x) => x.id === (l === "casa" ? j.idMandante : j.idVisitante));
    return t ? t.nome : (l === "casa" ? "Casa" : "Fora");
};

// ===== RENDERIZAÇÃO =====
function renderizarSeletorJogo() {
    const times = timesDaCategoria();
    const nome = (id) => (times.find((t) => t.id === id) || {}).nome || "?";
    $("sel-rodada").innerHTML = rodadasDe(jogosDaCategoria())
        .map((r) => `<option value="${r}" ${r === rodadaAtiva ? "selected" : ""}>${rotuloRodada(r)}</option>`).join("");
    $("sel-jogo").innerHTML = jogosDaRodada()
        .map((j) => {
            const marca = j.jogado ? ` · ✔ ${j.setsMandante}x${j.setsVisitante}` : j.emAndamento ? ` · ao vivo ${j.setsMandante}x${j.setsVisitante}` : "";
            return `<option value="${j.idJogo}" ${j.idJogo === idJogo ? "selected" : ""}>
            ${esc(nome(j.idMandante))} x ${esc(nome(j.idVisitante))} (${esc(rotuloJogo(j))})${marca}</option>`;
        }).join("")
        || "<option value=''>Nenhum jogo cadastrado</option>";
}

function renderizarResumo() {
    const j = jogoAtual();
    if (!j) { $("resumo-jogo").textContent = ""; return; }
    const times = timesDaCategoria();
    const linha = (idTime) => {
        const t = times.find((x) => x.id === idTime);
        const ids = elencoDe(idTime).map((a) => a.id);
        const p = ids.reduce((s, id) => s + pontos(id, idJogo), 0);
        const e = ids.reduce((s, id) => s + erros(id, idJogo), 0);
        return `${esc(t ? t.nome : "?")}: ${p} pts, ${e} erros`;
    };
    $("resumo-jogo").innerHTML = `${linha(j.idMandante)} &nbsp;|&nbsp; ${linha(j.idVisitante)}`;
    const casa = times.find((t) => t.id === j.idMandante), fora = times.find((t) => t.id === j.idVisitante);
    $("btn-casa").textContent = casa ? casa.nome : "Casa";
    $("btn-fora").textContent = fora ? fora.nome : "Fora";
}

function renderizarCards() {
    const time = timeAtual();
    if (!time) { $("cards").innerHTML = "<p>Escolha um jogo.</p>"; return; }
    const p = placarAtual();
    const bloqueado = !p || p.encerrado ? "disabled" : "";   // jogo encerrado: use "Desfazer" para corrigir
    $("cards").innerHTML = elencoDe(time.id).map((a) => `
        <div class="atleta">
            <div class="atleta-topo">
                <img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
                <div class="info">
                    <strong>${esc(rotuloAtleta(a))}</strong>
                    <small>${esc(rotuloPosicao(a.posicao, categoria))}</small>
                </div>
                <span class="pts">${pontos(a.id, idJogo)} pts<br>${erros(a.id, idJogo)} erros</span>
            </div>
            <div class="botoes-stat">
                ${STATS.map((s) => `
                    <button class="btn-stat ${s.tipo}" data-atleta="${a.id}" data-tipo="${s.chave}" ${bloqueado}
                        title="${s.tipo === "erro" ? "O adversário ganha 1 ponto" : "Soma 1 ponto para o time"}">
                        + ${s.rotulo}<small>${contar(a.id, s.chave, idJogo)}</small>
                    </button>`).join("")}
            </div>
        </div>`).join("")
        || `<p>Nenhum atleta em ${esc(time.nome)}. Cadastre o elenco no arquivo js/elencos.js.</p>`;
}

function renderizarLog() {
    const jogo = jogoAtual();
    const doJogo = jogadas.filter((j) => j.idJogo === idJogo);
    const timeDoAtleta = new Map(atletas.map((a) => [a.id, a.idTime]));
    const linhas = [];
    for (let i = Math.max(0, doJogo.length - 6); i < doJogo.length; i++) {
        const j = doJogo[i];
        const a = atletas.find((x) => x.id === j.idAtleta);
        const s = STATS.find((x) => x.chave === j.tipo);
        const hora = new Date(j.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const quem = j.tipo === "extra" ? "Ponto da equipe" : `${a ? esc(rotuloAtleta(a)) : "?"} · ${s ? s.rotulo : esc(j.tipo)}`;

        // "→ +1 Gerdau Minas (12 x 10)": quem recebeu o ponto e como ficou o set
        let efeito = "";
        if (jogo) {
            const lado = ladoDoPonto(jogo, j, timeDoAtleta);
            const antes = calcularPlacar(jogo, doJogo.slice(0, i), timeDoAtleta);
            const depois = calcularPlacar(jogo, doJogo.slice(0, i + 1), timeDoAtleta);
            const fechou = depois.parciais.length > antes.parciais.length ? depois.parciais[depois.parciais.length - 1] : null;
            if (lado) efeito = ` → +1 ${esc(nomeDoLado(lado))} (${fechou ? `set fechado ${fechou.casa}-${fechou.fora}` : `${depois.atual.casa} x ${depois.atual.fora}`})`;
        }
        linhas.push(`<li>${hora} · ${quem}${efeito}</li>`);
    }
    $("log").innerHTML = linhas.reverse().join("") || '<li class="vazio">Nenhuma jogada lançada neste jogo.</li>';
}

function renderizarListaElenco() {
    const lista = elencoDe(timeElenco);
    $("contagem-elenco").textContent = `${lista.length} atleta(s) cadastrado(s)`;
    $("lista-elenco").innerHTML = lista.map((a) => `
        <li class="linha-atleta">
            <img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
            <div class="info">
                <strong>${esc(rotuloAtleta(a))}</strong>
                <small>${esc(rotuloPosicao(a.posicao, categoria))}</small>
            </div>
        </li>`).join("") || '<li class="vazio">Nenhum atleta neste time ainda. Cadastre no js/elencos.js.</li>';
}

function renderizarTabelaTemporada() {
    const times = timesDaCategoria();
    const lista = atletas.filter((a) => a.categoria === categoria);
    const totais = totaisDosAtletas(lista, jogadas);
    const linhas = lista
        .map((a) => ({ a, t: totais.get(a.id) }))
        .sort((x, y) => y.t.pontos - x.t.pontos || x.t.erro - y.t.erro)
        .map(({ a, t }) => `
            <tr>
                <td class="nome"><span class="time"><img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
                    ${esc(rotuloAtleta(a))}</span></td>
                <td class="nome">${esc((times.find((x) => x.id === a.idTime) || {}).nome || "?")}</td>
                ${tiposDePonto.map((k) => `<td>${t[k]}</td>`).join("")}
                <td><strong>${t.pontos}</strong></td>
                <td>${t.erro}</td>
            </tr>`).join("");
    const cab = STATS.filter((s) => s.tipo === "ponto").map((s) => `<th>${s.rotulo}</th>`).join("");
    $("tabela").innerHTML = linhas
        ? `<table class="tabela-stats"><thead><tr><th>Atleta</th><th>Time</th>${cab}<th>Pts</th><th>Erros</th></tr></thead>
        <tbody>${linhas}</tbody></table>`
        : "<p>Cadastre atletas para ver os totais.</p>";
}

// Opções que só mudam ao trocar de modalidade
function renderizarOpcoes() {
    $("sel-time").innerHTML = timesDaCategoria()
        .map((t) => `<option value="${t.id}" ${t.id === timeElenco ? "selected" : ""}>${esc(t.nome)}</option>`).join("");
}

// Placar no topo da seção de lançamento (sets, pontos do set atual e parciais)
function renderizarPlacar() {
    const j = jogoAtual(), p = placarAtual();
    const v = p || { setsCasa: 0, setsFora: 0, parciais: [], set: 1, atual: { casa: 0, fora: 0 }, encerrado: false };
    // com o jogo encerrado, mostra os pontos do último set em vez de 0 x 0
    const pts = v.encerrado && v.parciais.length ? v.parciais[v.parciais.length - 1] : v.atual;

    $("pl-nome-casa").textContent = nomeDoLado("casa");
    $("pl-nome-fora").textContent = nomeDoLado("fora");
    $("btn-extra-casa").textContent = `+1 ${nomeDoLado("casa")} (equipe)`;
    $("btn-extra-fora").textContent = `+1 ${nomeDoLado("fora")} (equipe)`;
    $("pl-sets-casa").textContent = v.setsCasa;
    $("pl-sets-fora").textContent = v.setsFora;
    $("pl-pts-casa").textContent = pts.casa;
    $("pl-pts-fora").textContent = pts.fora;
    $("pl-set").textContent = !j ? "Escolha um jogo" : v.encerrado ? "Jogo encerrado" : `Set ${v.set}${v.set === 5 ? " (vai a 15)" : ""}`;
    $("pl-parciais").textContent = v.parciais.length ? "Sets: " + v.parciais.map((x) => `${x.casa}-${x.fora}`).join(" · ") : "";

    const bloqueado = !j || v.encerrado;
    $("btn-extra-casa").disabled = $("btn-extra-fora").disabled = bloqueado;
    $("pl-aviso").textContent = avisoPlacar || (v.encerrado ? `Jogo encerrado: ${v.setsCasa} x ${v.setsFora}. Para corrigir, use "Desfazer".` : "");
}

// Placar final digitado à mão (só para jogos sem jogadas)
function renderizarManual() {
    const j = jogoAtual();
    const manual = j && ler(K_JOGOS).find((x) => x.idJogo === j.idJogo && x.jogado);
    const temJogadas = jogadas.some((x) => x.idJogo === idJogo);
    $("manual-status").textContent = !j ? "" : temJogadas ? "Este jogo tem jogadas lançadas: o placar vem delas."
        : manual ? `Placar manual salvo: ${manual.setsMandante} x ${manual.setsVisitante}.` : "Nenhum placar manual salvo neste jogo.";
    $("btn-manual-salvar").disabled = !j || temJogadas;
    $("btn-manual-limpar").disabled = !manual;
}

function renderizarTudo() {
    jogos.splice(0, jogos.length, ...carregarJogos());   // atualiza o andamento de cada jogo no seletor
    renderizarSeletorJogo(); renderizarResumo(); renderizarPlacar(); renderizarCards();
    renderizarLog(); renderizarManual(); renderizarListaElenco(); renderizarTabelaTemporada();
}

$("sel-time").addEventListener("change", (e) => { timeElenco = parseInt(e.target.value, 10); renderizarTudo(); });

// ===== NAVEGAÇÃO E LANÇAMENTO =====
function marcarAba(idAtivo, idInativo) {
    $(idAtivo).classList.add("ativo"); $(idAtivo).setAttribute("aria-pressed", "true");
    $(idInativo).classList.remove("ativo"); $(idInativo).setAttribute("aria-pressed", "false");
}

function trocarCategoria(cat) {
    categoria = cat;
    lado = "casa";
    avisoPlacar = "";
    marcarAba(cat === "F" ? "btn-fem" : "btn-masc", cat === "F" ? "btn-masc" : "btn-fem");
    marcarAba("btn-casa", "btn-fora");
    rodadaAtiva = rodadaPadrao(jogosDaCategoria());
    const primeiro = jogosDaRodada()[0];
    idJogo = primeiro ? primeiro.idJogo : null;
    timeElenco = timesDaCategoria()[0].id;
    renderizarOpcoes();
    renderizarTudo();
}

$("btn-fem").addEventListener("click", () => trocarCategoria("F"));
$("btn-masc").addEventListener("click", () => trocarCategoria("M"));
$("btn-casa").addEventListener("click", () => { lado = "casa"; marcarAba("btn-casa", "btn-fora"); renderizarTudo(); });
$("btn-fora").addEventListener("click", () => { lado = "fora"; marcarAba("btn-fora", "btn-casa"); renderizarTudo(); });
$("sel-rodada").addEventListener("change", (e) => {
    rodadaAtiva = e.target.value;
    lado = "casa";
    avisoPlacar = "";
    marcarAba("btn-casa", "btn-fora");
    const primeiro = jogosDaRodada()[0];
    idJogo = primeiro ? primeiro.idJogo : null;
    renderizarTudo();
});
$("sel-jogo").addEventListener("change", (e) => { idJogo = parseInt(e.target.value, 10) || null; avisoPlacar = ""; renderizarTudo(); });

// Registra uma jogada: o ponto vai direto para o placar do time certo
function lancarJogada(dados) {
    const jogo = jogoAtual();
    const antes = placarAtual();
    if (!jogo || !antes || antes.encerrado) return;
    const nova = { id: novoId(), idJogo, ...dados, ts: Date.now() };
    jogadas.push(nova);
    gravar(K_JOGADAS, jogadas);

    const ladoPonto = ladoDoPonto(jogo, nova, new Map(atletas.map((a) => [a.id, a.idTime])));
    const depois = placarAtual();

    // Ex.: "Thaisa · Ataque → +1 Gerdau Minas. Set 1 encerrado: 25-21."
    const atleta = atletas.find((a) => a.id === nova.idAtleta);
    const stat = STATS.find((s) => s.chave === nova.tipo);
    let aviso = `${atleta ? `${atleta.nome} · ${stat ? stat.rotulo : ""}` : "Ponto da equipe"} → +1 ${nomeDoLado(ladoPonto)}`;
    if (depois.encerrado) {
        aviso += `. Jogo encerrado: ${depois.setsCasa} x ${depois.setsFora}.`;
    } else if (depois.parciais.length > antes.parciais.length) {
        const u = depois.parciais[depois.parciais.length - 1];
        aviso += `. Set ${antes.set} encerrado: ${u.casa}-${u.fora}.`;
    }
    avisoPlacar = aviso;
    if (navigator.vibrate) navigator.vibrate(depois.encerrado ? [60, 40, 60] : 30);   // feedback no celular
    renderizarTudo();

    // pulso no placar do time que pontuou
    const el = $(ladoPonto === "casa" ? "pl-pts-casa" : "pl-pts-fora");
    el.classList.remove("marcou");
    void el.offsetWidth;
    el.classList.add("marcou");
}

// Toque numa atleta: vira uma jogada (e o placar já muda)
$("cards").addEventListener("click", (e) => {
    const stat = e.target.closest(".btn-stat");
    if (!stat || stat.disabled) return;
    lancarJogada({ idAtleta: stat.dataset.atleta, tipo: stat.dataset.tipo });
});

// Ponto da equipe sem atleta (erro de rede, toque duplo...)
["btn-extra-casa", "btn-extra-fora"].forEach((id) =>
    $(id).addEventListener("click", (e) => lancarJogada({ idAtleta: null, tipo: "extra", lado: e.currentTarget.dataset.lado })));

function desfazerUltima() {
    for (let i = jogadas.length - 1; i >= 0; i--) {
        if (jogadas[i].idJogo === idJogo) {
            jogadas.splice(i, 1);
            gravar(K_JOGADAS, jogadas);
            avisoPlacar = "";
            renderizarTudo();
            return;
        }
    }
}
$("btn-desfazer").addEventListener("click", desfazerUltima);
$("btn-desfazer-topo").addEventListener("click", desfazerUltima);

$("btn-zerar-jogo").addEventListener("click", () => {
    if (!idJogo || !jogadas.some((j) => j.idJogo === idJogo)) return;
    if (!confirm("Apagar TODAS as jogadas e o placar deste jogo?")) return;
    jogadas = jogadas.filter((j) => j.idJogo !== idJogo);
    gravar(K_JOGADAS, jogadas);
    avisoPlacar = "";
    renderizarTudo();
});

// Placar final à mão (jogos sem jogadas)
$("btn-manual-salvar").addEventListener("click", () => {
    if (!idJogo) return;
    const casa = parseInt($("manual-casa").value, 10), fora = parseInt($("manual-fora").value, 10);
    // Vôlei: exatamente um time chega a 3 sets e o outro fica com 0, 1 ou 2
    if (isNaN(casa) || isNaN(fora) || casa < 0 || fora < 0 || casa > 3 || fora > 3 || (casa === 3) === (fora === 3)) {
        alert("Placar inválido! Um time deve vencer com 3 sets.");
        return;
    }
    const lista = ler(K_JOGOS).filter((x) => x.idJogo !== idJogo);
    lista.push({ idJogo, setsMandante: casa, setsVisitante: fora, jogado: true });
    gravar(K_JOGOS, lista);
    $("manual-casa").value = $("manual-fora").value = "";
    renderizarTudo();
});
$("btn-manual-limpar").addEventListener("click", () => {
    if (!confirm("Limpar o placar manual deste jogo?")) return;
    gravar(K_JOGOS, ler(K_JOGOS).filter((x) => x.idJogo !== idJogo));
    renderizarTudo();
});

// ===== BACKUP =====
// Os atletas ficam no código (elencos.js): o backup guarda só as jogadas e os placares digitados à mão.
$("btn-exportar").addEventListener("click", () => {
    // Este arquivo é o que o site público lê: suba-o no GitHub com o nome dados.json
    const dados = { geradoEm: new Date().toISOString(), jogadas, jogos: ler(K_JOGOS).filter((j) => j.jogado) };
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dados.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

$("arquivo-backup").addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
        try {
            const d = JSON.parse(leitor.result);
            if (!Array.isArray(d.jogadas)) throw new Error("formato");
            if (!confirm(`Importar ${d.jogadas.length} jogadas? Isso SUBSTITUI as jogadas e placares deste navegador.`)) return;
            jogadas = d.jogadas;
            gravar(K_JOGADAS, jogadas);
            gravar(K_JOGOS, Array.isArray(d.jogos) ? d.jogos : []);
            avisoPlacar = "";
            renderizarTudo();
        } catch (err) { alert("Arquivo de backup inválido."); }
    };
    leitor.readAsText(arquivo);
    e.target.value = "";
});

// ===== INÍCIO =====
trocarCategoria("F");