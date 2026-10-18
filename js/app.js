"use strict";

// ===== ESTADO =====
let categoriaAtiva = "F";   // "F" = Feminino, "M" = Masculino
let jogosDaTemporada = [];
let rodadaAtiva = "";   // ex.: "T-1" = Turno, rodada 1 ("" = escolher automaticamente)

// ===== UTILIDADES =====
// ($, esc, STATS e as funções de atletas vêm do atletas.js)

const obterTimes = (cat = categoriaAtiva) =>
    cat === "F" ? tabelaSuperligaFeminina : tabelaSuperligaMasculina;

// <img> do time com fallback (this.onerror=null evita loop se o fallback também falhar)
const imgTime = (time, classe = "logo-time") =>
    `<img src="${esc(time.logo)}" alt="" class="${classe}" loading="lazy"
          onerror="this.onerror=null;this.src='img/logo_reduzida.png'">`;

// ===== DADOS =====
function carregarJogos() {
    // calendário do teams.js + resultados finalizados no admin (navegador ou dados.json)
    jogosDaTemporada = montarJogos();
}

// ===== CLASSIFICAÇÃO =====
// Quociente de sets (ganhos / perdidos), tratando divisão por zero
const quociente = (t) => t.setsPerdidos === 0 ? (t.setsGanhos > 0 ? Infinity : 0) : t.setsGanhos / t.setsPerdidos;

// Critérios: pontos, vitórias, quociente de sets, nome
const comparar = (a, b) =>
    b.pontos - a.pontos || b.vitorias - a.vitorias || quociente(b) - quociente(a) || a.nome.localeCompare(b.nome);

// Calcula a tabela sem alterar os dados originais de teams.js
function calcularClassificacao(cat) {
    const tabela = obterTimes(cat).map((t) => ({
        ...t, pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0
    }));
    const porId = new Map(tabela.map((t) => [t.id, t]));

    jogosDaTemporada.filter((j) => j.categoria === cat && j.jogado).forEach((j) => {
        const mandante = porId.get(j.idMandante);
        const visitante = porId.get(j.idVisitante);
        if (!mandante || !visitante) return;

        mandante.setsGanhos += j.setsMandante; mandante.setsPerdidos += j.setsVisitante;
        visitante.setsGanhos += j.setsVisitante; visitante.setsPerdidos += j.setsMandante;

        const mandanteVenceu = j.setsMandante === 3;
        const vencedor = mandanteVenceu ? mandante : visitante;
        const perdedor = mandanteVenceu ? visitante : mandante;
        const setsDoPerdedor = mandanteVenceu ? j.setsVisitante : j.setsMandante;

        vencedor.vitorias++;
        perdedor.derrotas++;
        // 3-0 e 3-1: 3 pontos x 0 | 3-2: 2 pontos x 1
        vencedor.pontos += setsDoPerdedor === 2 ? 2 : 3;
        perdedor.pontos += setsDoPerdedor === 2 ? 1 : 0;
    });

    return tabela.sort(comparar);
}

// ===== RENDERIZAÇÃO =====
function renderizarClassificacao() {
    const linhas = calcularClassificacao(categoriaAtiva).map((t, i) => `
        <tr>
            <td><strong>${i + 1}º</strong></td>
            <td class="col-time"><span class="time">${imgTime(t)} ${esc(t.nome)}</span></td>
            <td>${t.vitorias + t.derrotas}</td>
            <td><strong>${t.pontos}</strong></td>
            <td>${t.vitorias}</td>
            <td>${t.derrotas}</td>
            <td>${t.setsGanhos}</td>
            <td>${t.setsPerdidos}</td>
        </tr>`).join("");

    $("container-tabela").innerHTML = `
        <table class="tabela-stats">
            <thead><tr>
                <th scope="col">Pos</th><th scope="col" class="col-time">Time</th>
                <th scope="col" title="Jogos">J</th><th scope="col" title="Pontos">P</th>
                <th scope="col" title="Vitórias">V</th><th scope="col" title="Derrotas">D</th>
                <th scope="col" title="Sets ganhos">SG</th><th scope="col" title="Sets perdidos">SP</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
        </table>`;
}

function renderizarJogos() {
    const times = obterTimes();
    const doTime = (id) => times.find((t) => t.id === id);
    let cards = "";

    // Filtro de rodada (são 22 rodadas por categoria)
    const daCategoria = jogosDaTemporada.filter((j) => j.categoria === categoriaAtiva);
    const rodadas = rodadasDe(daCategoria);
    if (!rodadas.includes(rodadaAtiva)) rodadaAtiva = rodadaPadrao(daCategoria);
    $("filtro-rodada").innerHTML = rodadas
        .map((r) => `<option value="${r}" ${r === rodadaAtiva ? "selected" : ""}>${rotuloRodada(r)}</option>`).join("");
    const indiceRodada = rodadas.indexOf(rodadaAtiva);
    $("rodada-titulo").textContent = rotuloRodada(rodadaAtiva);
    $("rodada-anterior").disabled = indiceRodada <= 0;
    $("rodada-proxima").disabled = indiceRodada >= rodadas.length - 1;

    const aoVivo = mapaAoVivo();   // partidas em andamento (ao-vivo.js)
    daCategoria.filter((j) => chaveRodada(j) === rodadaAtiva).forEach((jogo) => {
        const casa = doTime(jogo.idMandante);
        const fora = doTime(jogo.idVisitante);
        if (!casa || !fora) return;

        const vivo = jogo.jogado ? null : aoVivo.get(jogo.idJogo);
        const placar = jogo.jogado ? `${jogo.setsMandante} x ${jogo.setsVisitante}`
            : vivo ? `${vivo.setsMandante} x ${vivo.setsVisitante}` : "vs";
        const selo = vivo ? `<span class="selo-ao-vivo${vivo.encerrado ? " encerrado" : ""}">${vivo.encerrado ? "ENCERRADO" : "● AO VIVO"}</span><br>` : "";
        const pontos = vivo && !vivo.encerrado ? `<small class="pontos-vivo">Set ${vivo.setAtual}: ${vivo.mandante} x ${vivo.visitante}</small>` : "";
        cards += `
            <article class="card-jogo">
                ${selo}<small>${esc(rotuloJogo(jogo))}</small>${jogo.local ? `<br><small>${esc(jogo.local)}</small>` : ""}
                <div class="confronto">
                    <div>${imgTime(casa, "")}${esc(casa.nome)}</div>
                    <div class="placar-jogo">${placar}${pontos}</div>
                    <div>${imgTime(fora, "")}${esc(fora.nome)}</div>
                </div>
            </article>`;
    });

    $("lista-confrontos").innerHTML = cards || "<p>Nenhum jogo cadastrado.</p>";
}

function renderizarListaEquipes() {
    $("lista-equipes").innerHTML = obterTimes()
        .map((t) => `<span class="time">${imgTime(t)} ${esc(t.nome)}</span>`).join("");
}

// ===== ATLETAS: RANKING E ELENCO =====
let timeFiltro = "";   // "" = todos os times

function renderizarAtletas() {
    const times = obterTimes();
    const nomeTime = (id) => (times.find((t) => t.id === id) || {}).nome || "?";

    // Seletores (o de estatística é montado só uma vez)
    $("rank-time").innerHTML = '<option value="">Todos os times</option>' + times
        .map((t) => `<option value="${t.id}" ${String(t.id) === timeFiltro ? "selected" : ""}>${esc(t.nome)}</option>`).join("");
    const selStat = $("rank-stat");
    if (!selStat.options.length) {
        selStat.innerHTML = '<option value="pontos">Pontos (total)</option>' + STATS
            .map((s) => `<option value="${s.chave}">${s.tipo === "ponto" ? "Pontos de " + s.rotulo.toLowerCase() : "Erros"}</option>`).join("");
    }
    const chave = selStat.value || "pontos";

    const atletas = ler(K_ATLETAS).filter((a) => a.categoria === categoriaAtiva);
    const totais = totaisDosAtletas(atletas, ler(K_JOGADAS));
    const doFiltro = (a) => !timeFiltro || String(a.idTime) === timeFiltro;

    // Top 10 pela estatística escolhida (só quem tem pelo menos 1)
    const top = atletas.filter(doFiltro)
        .map((a) => ({ a, t: totais.get(a.id) }))
        .filter((x) => x.t[chave] > 0)
        .sort((x, y) => y.t[chave] - x.t[chave] || y.t.pontos - x.t.pontos || x.a.nome.localeCompare(y.a.nome))
        .slice(0, 10);

    $("ranking").innerHTML = top.map(({ a, t }, i) => `
        <li>
            <span class="pos">${i + 1}º</span>
            <img class="foto-mini" src="${esc(fotoDe(a))}" alt="" loading="lazy">
            <div class="info">
                <strong>${esc(a.nome)}</strong>
                <small>${esc(nomeTime(a.idTime))} · ${esc(rotuloPosicao(a.posicao, a.categoria))}</small>
                <small>${STATS.map((s) => `${s.rotulo} ${t[s.chave]}`).join(" · ")}</small>
            </div>
            <span class="valor">${t[chave]}</span>
        </li>`).join("") || '<li class="vazio">Ainda não há estatísticas lançadas.</li>';

    // Elenco completo do time escolhido
    if (!timeFiltro) {
        $("elenco-publico").innerHTML = '<p class="legenda">Escolha um time acima para ver o elenco completo.</p>';
        return;
    }
    $("elenco-publico").innerHTML = atletas.filter(doFiltro).sort((a, b) => a.numero - b.numero).map((a) => {
        const t = totais.get(a.id);
        return `
        <article class="card-atleta">
            <img class="foto-media" src="${esc(fotoDe(a))}" alt="" loading="lazy">
            <strong>#${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</strong>
            <small>${esc(rotuloPosicao(a.posicao, a.categoria))}</small>
            <small>${t.pontos} pts · ${t.erro} erros</small>
        </article>`;
    }).join("") || '<p class="legenda">Nenhum atleta cadastrado neste time.</p>';
}

const renderizarTudo = () => { renderizarClassificacao(); renderizarJogos(); renderizarAtletas(); renderizarListaEquipes(); };

// ===== EVENTOS =====
function trocarCategoria(cat) {
    categoriaAtiva = cat;
    rodadaAtiva = "";
    timeFiltro = "";
    [["F", $("btn-fem")], ["M", $("btn-masc")]].forEach(([c, btn]) => {
        btn.classList.toggle("ativo", c === cat);
        btn.setAttribute("aria-pressed", c === cat);
    });
    renderizarTudo();
}
$("btn-fem").addEventListener("click", () => trocarCategoria("F"));
$("btn-masc").addEventListener("click", () => trocarCategoria("M"));

$("filtro-rodada").addEventListener("change", (e) => { rodadaAtiva = e.target.value; renderizarJogos(); });
function navegarRodadaPublica(direcao) {
    const rodadas = rodadasDe(jogosDaTemporada.filter((j) => j.categoria === categoriaAtiva));
    const atual = rodadas.indexOf(rodadaAtiva);
    const proximo = Math.max(0, Math.min(rodadas.length - 1, atual + direcao));
    if (rodadas[proximo]) { rodadaAtiva = rodadas[proximo]; renderizarJogos(); }
}
$("rodada-anterior").addEventListener("click", () => navegarRodadaPublica(-1));
$("rodada-proxima").addEventListener("click", () => navegarRodadaPublica(1));
$("rank-stat").addEventListener("change", renderizarAtletas);
$("rank-time").addEventListener("change", (e) => { timeFiltro = e.target.value; renderizarAtletas(); });

// ===== INÍCIO =====
carregarDadosPublicos().then(() => {
    carregarJogos();
    renderizarTudo();
    // Placar ao vivo: cada mudança no banco redesenha a tela
    iniciarAoVivo(() => { carregarJogos(); renderizarTudo(); });
});