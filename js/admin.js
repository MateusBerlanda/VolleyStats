"use strict";
// Painel admin. Depende de teams.js e atletas.js (carregados antes no HTML).

// ===== ESTADO =====
let categoria = "F";
let lado = "casa";           // "casa" (mandante) ou "fora" (visitante)
let idJogo = null;
let rodadaAtiva = "";        // ex.: "T-1" = Turno, rodada 1
let timeElenco = 1;          // time mostrado na seção Elenco
let editandoId = null;       // atleta em edição (null = cadastrando um novo)
let fotoPendente;            // undefined = não mexeu na foto | texto = nova foto
let atletas = ler(K_ATLETAS);
let jogadas = ler(K_JOGADAS);

// Calendário do teams.js + resultados salvos pelo site
function carregarJogos() { return montarJogos(); }
const jogos = carregarJogos();

// ===== AUXILIARES =====
const timesDaCategoria = (cat = categoria) => cat === "F" ? tabelaSuperligaFeminina : tabelaSuperligaMasculina;
const jogosDaCategoria = () => jogos.filter((j) => j.categoria === categoria);
const jogosDaRodada = () => jogosDaCategoria().filter((j) => chaveRodada(j) === rodadaAtiva);
const jogoAtual = () => jogos.find((j) => j.idJogo === idJogo);
const elencoDe = (idTime) => atletas
    .filter((a) => a.categoria === categoria && a.idTime === idTime)
    .sort((a, b) => a.numero - b.numero);

function timeAtual() {
    const j = jogoAtual();
    if (!j) return null;
    return timesDaCategoria().find((t) => t.id === (lado === "casa" ? j.idMandante : j.idVisitante)) || null;
}

const contar = (idAtleta, tipo, jogo) =>
    jogadas.filter((j) => j.idAtleta === idAtleta && j.tipo === tipo && (jogo == null || j.idJogo === jogo)).length;
const tiposDePonto = STATS.filter((s) => s.tipo === "ponto").map((s) => s.chave);
const pontos = (idAtleta, jogo) => tiposDePonto.reduce((soma, tipo) => soma + contar(idAtleta, tipo, jogo), 0);
// Erros do TIME no jogo (botão "Erro do time"): a jogada "erro_time" fica ligada a uma atleta do time que errou
const errosDoTime = (idTime, jogo) => jogadas.filter((j) => j.tipo === "erro_time" && String(j.idJogo) === String(jogo) &&
    String((atletas.find((a) => String(a.id) === String(j.idAtleta)) || {}).idTime) === String(idTime)).length;

// Placar por sets, reconstruído a partir do histórico para continuar correto
// quando uma jogada é excluída. Sets 1–4 vão a 25; o 5º vai a 15, sempre
// exigindo dois pontos de diferença. Melhor de cinco sets (vence quem fizer 3).
// O cálculo fica no placar.js (compartilhado com o site público)
function calcularPlacarPontos(jogo) {
    return calcularPlacar(jogo, atletas, jogadas);
}

// Reduz a foto para 128x128 (recorte quadrado) em JPEG: ~5 KB, cabe no localStorage
function processarFoto(arquivo) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(arquivo);
        img.onload = () => {
            const T = 128, lado = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = T;
            // recorte puxado para o topo (rostos costumam ficar na parte de cima)
            const sy = (img.height - lado) * 0.15;
            canvas.getContext("2d").drawImage(img, (img.width - lado) / 2, sy, lado, lado, 0, 0, T, T);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("imagem inválida")); };
        img.src = url;
    });
}

// Se uma jogada de partida finalizada for corrigida, tira o resultado da tabela
// até que a partida seja finalizada novamente com o placar corrigido.
function invalidarResultadoSalvo(idAlterado) {
    const salvos = ler(K_JOGOS);
    const atualizados = salvos.filter((x) => String(x.idJogo) !== String(idAlterado));
    if (atualizados.length !== salvos.length) {
        gravar(K_JOGOS, atualizados);
        nuvemEnfileirar({ t: "jogo-del", id: Number(idAlterado) });
    }
    const jogo = jogos.find((x) => String(x.idJogo) === String(idAlterado));
    if (jogo) { jogo.jogado = false; jogo.setsMandante = null; jogo.setsVisitante = null; }
}

// ===== RENDERIZAÇÃO =====
function renderizarSeletorJogo() {
    const times = timesDaCategoria();
    const nome = (id) => (times.find((t) => t.id === id) || {}).nome || "?";
    const rodadas = rodadasDe(jogosDaCategoria());
    $("sel-rodada").innerHTML = rodadas
        .map((r) => `<option value="${r}" ${r === rodadaAtiva ? "selected" : ""}>${rotuloRodada(r)}</option>`).join("");
    const indiceRodada = rodadas.indexOf(rodadaAtiva);
    $("admin-rodada-titulo").textContent = rotuloRodada(rodadaAtiva);
    $("admin-rodada-anterior").disabled = indiceRodada <= 0;
    $("admin-rodada-proxima").disabled = indiceRodada >= rodadas.length - 1;
    $("sel-jogo").innerHTML = jogosDaRodada()
        .map((j) => `<option value="${j.idJogo}" ${j.idJogo === idJogo ? "selected" : ""}>
            ${esc(nome(j.idMandante))} x ${esc(nome(j.idVisitante))} (${esc(rotuloJogo(j))})</option>`).join("")
        || "<option value=''>Nenhum jogo cadastrado</option>";
}

function renderizarResumo() {
    const j = jogoAtual();
    if (!j) { $("resumo-jogo").innerHTML = ""; return; }
    const times = timesDaCategoria();
    const casa = times.find((t) => String(t.id) === String(j.idMandante));
    const fora = times.find((t) => String(t.id) === String(j.idVisitante));
    const placar = calcularPlacarPontos(j);
    const errosCasa = errosDoTime(j.idMandante, idJogo);
    const errosFora = errosDoTime(j.idVisitante, idJogo);
    const estadoSet = placar.encerrado ? "Partida encerrada" : `Set ${placar.setAtual}`;
    // Parciais dos sets já terminados, ex.: 25x22 (mandante primeiro)
    const parciais = placar.sets.map((s) => `<small class="parcial" title="Set ${s.numero}">${s.mandante}x${s.visitante}</small>`).join("");
    const notaFinal = j.jogado
        ? `<small class="partida-encerrada">Partida finalizada e contabilizada</small>`
        : placar.encerrado
            ? `<small class="partida-encerrada">Fim de jogo</small><button type="button" id="btn-finalizar-partida" class="btn-finalizar-partida">Finalizar partida e atualizar classificação</button>`
            : "";
    $("resumo-jogo").innerHTML = `
        <div class="placar-painel" role="status" aria-live="polite">
            <div class="placar-time casa">
                <span class="placar-selo">CASA</span>
                <strong class="placar-nome">${esc(casa ? casa.nome : "Mandante")}</strong>
                <span class="placar-pontos">${placar.mandante}</span>
                <small>${errosCasa} erro(s) do time</small>
                <button type="button" class="btn-erro-time" data-erro-time="mandante" ${placar.encerrado ? "disabled" : ""}>Erro do time</button>
            </div>
            <div class="placar-centro">
                <span>${esc(estadoSet.toUpperCase())}</span>
                <b class="sets-grande" title="Sets ganhos">${placar.setsMandante}x${placar.setsVisitante}</b>
                ${parciais ? `<div class="parciais">${parciais}</div>` : ""}
            </div>
            <div class="placar-time fora">
                <span class="placar-selo">FORA</span>
                <strong class="placar-nome">${esc(fora ? fora.nome : "Visitante")}</strong>
                <span class="placar-pontos">${placar.visitante}</span>
                <small>${errosFora} erro(s) do time</small>
                <button type="button" class="btn-erro-time" data-erro-time="visitante" ${placar.encerrado ? "disabled" : ""}>Erro do time</button>
            </div>
            ${notaFinal}
        </div>`;

    $("btn-casa").textContent = casa ? casa.nome : "Casa";
    $("btn-fora").textContent = fora ? fora.nome : "Fora";
}

function renderizarCards() {
    const time = timeAtual();
    if (!time) { $("cards").innerHTML = "<p>Escolha um jogo.</p>"; return; }
    const partidaEncerrada = calcularPlacarPontos(jogoAtual()).encerrado;
    $("cards").innerHTML = elencoDe(time.id).map((a) => `
        <div class="atleta">
            <div class="atleta-topo">
                <img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
                <div class="info">
                    <strong>${esc(a.nome)}</strong>
                    <small><span class="camisa">${a.numero == null ? "—" : "#" + a.numero}</span>${esc(rotuloPosicao(a.posicao, categoria))}</small>
                </div>
                <div class="pts-badge" title="Pontos neste jogo"><b>${pontos(a.id, idJogo)}</b><span>pts</span></div>
            </div>
            <div class="botoes-stat">
                ${STATS.map((s) => `
                    <button class="btn-stat stat-${s.chave} ${s.tipo}" data-atleta="${a.id}" data-tipo="${s.chave}" ${partidaEncerrada ? "disabled title=\"Partida encerrada\"" : ""}>
                        <span class="stat-rotulo">+ ${s.rotulo}</span><small>${contar(a.id, s.chave, idJogo)}</small>
                    </button>`).join("")}
            </div>
        </div>`).join("")
        || `<p>Nenhum atleta em ${esc(time.nome)}. Cadastre o elenco na seção Elenco, mais abaixo.</p>`;
}

function renderizarLog() {
    const recentes = jogadas.filter((j) => j.idJogo === idJogo).slice(-8).reverse();
    $("log").innerHTML = recentes.map((j) => {
        const a = atletas.find((x) => String(x.id) === String(j.idAtleta));
        const s = STATS.find((x) => x.chave === j.tipo);
        const erroTime = j.tipo === "erro_time";
        const hora = new Date(j.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const jogo = jogoAtual();
        const timeAtleta = a && jogo ? (String(a.idTime) === String(jogo.idMandante) ? "mandante" : String(a.idTime) === String(jogo.idVisitante) ? "visitante" : "") : "";
        const ladoErroEfetivo = j.tipo === "erro_time" ? (j.ladoErro || timeAtleta) : timeAtleta;
        const pontoPara = (j.tipo === "erro" || j.tipo === "erro_time") ? (ladoErroEfetivo === "mandante" ? "visitante" : ladoErroEfetivo === "visitante" ? "mandante" : "") : timeAtleta;
        const timeQuePontua = pontoPara === "mandante" ? (timesDaCategoria().find(t => String(t.id) === String(jogo?.idMandante)) || {}).nome
            : pontoPara === "visitante" ? (timesDaCategoria().find(t => String(t.id) === String(jogo?.idVisitante)) || {}).nome : "";
        return `<li class="jogada-item ${j.tipo === "erro" ? "jogada-erro" : ""}">
            <div class="jogada-detalhe"><span class="jogada-hora">${hora}</span><span class="jogada-descricao">${erroTime ? "Erro coletivo do " + esc((timesDaCategoria().find(t => String(t.id) === String((j.ladoErro || timeAtleta) === "mandante" ? jogo?.idMandante : jogo?.idVisitante)) || {}).nome || "time") : a ? "#" + (a.numero == null ? "—" : a.numero) + " " + esc(a.nome) : "Atleta desconhecida"} · ${erroTime ? "Erro do time" : s ? s.rotulo : esc(j.tipo)}</span>
            ${timeQuePontua ? `<small class="jogada-ponto">${j.tipo === "erro" ? "Ponto para " : "Ponto para "}${esc(timeQuePontua)}</small>` : ""}</div>
            <button type="button" class="btn-excluir-jogada" data-remover-jogada="${esc(j.id)}" aria-label="Excluir esta jogada" title="Excluir esta jogada">×</button>
        </li>`;
    }).join("") || '<li class="vazio">Nenhuma jogada lançada neste jogo.</li>';
}

function renderizarListaElenco() {
    const lista = elencoDe(timeElenco);
    $("contagem-elenco").textContent = `${lista.length} atleta(s) cadastrado(s)`;
    $("lista-elenco").innerHTML = lista.map((a) => `
        <li class="linha-atleta">
            <img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
            <div class="info">
                <strong> #${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</strong>
                <small>${esc(rotuloPosicao(a.posicao, categoria))}</small>
            </div>
            <button class="btn-mini" data-editar="${a.id}">Editar</button>
            <button class="btn-mini perigo" data-remover="${a.id}">Remover</button>
        </li>`).join("") || '<li class="vazio">Nenhum atleta neste time ainda.</li>';
}

function renderizarTabelaTemporada() {
    const times = timesDaCategoria();
    const lista = atletas.filter((a) => a.categoria === categoria);
    const totais = totaisDosAtletas(lista, jogadas);
    const linhas = lista
        .map((a) => ({ a, t: totais.get(a.id) }))
        .sort((x, y) => y.t.pontos - x.t.pontos)
        .map(({ a, t }) => `
            <tr>
                <td class="nome"><span class="time"><img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
                     #${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</span></td>
                <td class="nome">${esc((times.find((x) => x.id === a.idTime) || {}).nome || "?")}</td>
                ${tiposDePonto.map((k) => `<td>${t[k]}</td>`).join("")}
                <td><strong>${t.pontos}</strong></td>
            </tr>`).join("");
    const cab = STATS.filter((s) => s.tipo === "ponto").map((s) => `<th>${s.rotulo}</th>`).join("");
    $("tabela").innerHTML = linhas
        ? `<table class="tabela-stats"><thead><tr><th>Atleta</th><th>Time</th>${cab}<th>Pts</th></tr></thead>
        <tbody>${linhas}</tbody></table>`
        : "<p>Cadastre atletas para ver os totais.</p>";
}

// Opções que só mudam ao trocar de modalidade
function renderizarOpcoes() {
    $("sel-time").innerHTML = timesDaCategoria()
        .map((t) => `<option value="${t.id}" ${t.id === timeElenco ? "selected" : ""}>${esc(t.nome)}</option>`).join("");
    $("atleta-posicao").innerHTML = '<option value="">Posição (opcional)</option>' +
        POSICOES.map((p) => `<option value="${p.chave}">${p[categoria]}</option>`).join("");
}

function renderizarTudo() {
    renderizarSeletorJogo(); renderizarResumo(); renderizarCards();
    renderizarLog(); renderizarListaElenco(); renderizarTabelaTemporada();
    renderizarPosJogo(false);
}

// ===== FORMULÁRIO DE ATLETA =====
function limparForm() {
    $("form-atleta").reset();
    $("form-atleta").hidden = true;
    editandoId = null;
    fotoPendente = undefined;
    $("previa-foto").src = AVATAR;
    $("btn-salvar-atleta").textContent = "Salvar alterações";
    $("btn-cancelar").hidden = false;
}

$("atleta-foto").addEventListener("change", async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    try {
        fotoPendente = await processarFoto(arquivo);
        $("previa-foto").src = fotoPendente;
    } catch (err) { alert("Não consegui ler essa imagem. Tente outra."); }
});

$("form-atleta").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!editandoId) return;
    const numero = parseInt($("atleta-numero").value, 10);
    const nome = $("atleta-nome").value.trim();
    const posicao = $("atleta-posicao").value;
    if (!nome) return;
    const time = timesDaCategoria().find((t) => t.id === timeElenco);
    if (atletas.some((a) => a.categoria === categoria && a.idTime === timeElenco && a.numero === numero && a.id !== editandoId)) {
        alert(`Já existe a camisa ${numero} em ${time.nome}.`);
        return;
    }
    const a = atletas.find((x) => x.id === editandoId);
    if (!a) return;
    Object.assign(a, { nome, numero, posicao });
    if (fotoPendente !== undefined) a.foto = fotoPendente;
    gravar(K_ATLETAS, atletas);
    nuvemEnfileirar({ t: "atleta", d: atletaParaLinha(a) });
    limparForm();
    renderizarTudo();
});

$("btn-cancelar").addEventListener("click", limparForm);

// Editar / remover na lista do elenco
$("lista-elenco").addEventListener("click", (e) => {
    const ed = e.target.closest("[data-editar]");
    if (ed) {
        const a = atletas.find((x) => x.id === ed.dataset.editar);
        if (!a) return;
        editandoId = a.id;
        $("form-atleta").hidden = false;
        fotoPendente = undefined;
        $("atleta-numero").value = a.numero;
        $("atleta-nome").value = a.nome;
        $("atleta-posicao").value = a.posicao || "";
        $("previa-foto").src = fotoDe(a);
        $("btn-salvar-atleta").textContent = "Salvar alterações";
        $("btn-cancelar").hidden = false;
        $("form-atleta").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }
    const rem = e.target.closest("[data-remover]");
    if (rem && confirm("Remover este atleta e TODAS as jogadas dele?")) {
        atletas = atletas.filter((a) => a.id !== rem.dataset.remover);
        jogadas = jogadas.filter((j) => j.idAtleta !== rem.dataset.remover);
        gravar(K_ATLETAS, atletas); gravar(K_JOGADAS, jogadas);
        nuvemEnfileirar({ t: "atleta-del", id: rem.dataset.remover });   // no banco, as jogadas dela caem junto
        if (editandoId === rem.dataset.remover) limparForm();
        renderizarTudo();
    }
});

$("sel-time").addEventListener("change", (e) => { timeElenco = parseInt(e.target.value, 10); limparForm(); renderizarTudo(); });

// ===== NAVEGAÇÃO E LANÇAMENTO =====
function marcarAba(idAtivo, idInativo) {
    $(idAtivo).classList.add("ativo"); $(idAtivo).setAttribute("aria-pressed", "true");
    $(idInativo).classList.remove("ativo"); $(idInativo).setAttribute("aria-pressed", "false");
}

function trocarCategoria(cat) {
    categoria = cat;
    lado = "casa";
    marcarAba(cat === "F" ? "btn-fem" : "btn-masc", cat === "F" ? "btn-masc" : "btn-fem");
    marcarAba("btn-casa", "btn-fora");
    rodadaAtiva = rodadaPadrao(jogosDaCategoria());
    const primeiro = jogosDaRodada()[0];
    idJogo = primeiro ? primeiro.idJogo : null;
    timeElenco = timesDaCategoria()[0].id;
    renderizarOpcoes();
    limparForm();
    renderizarTudo();
}

$("btn-fem").addEventListener("click", () => trocarCategoria("F"));
$("btn-masc").addEventListener("click", () => trocarCategoria("M"));
$("btn-casa").addEventListener("click", () => { lado = "casa"; marcarAba("btn-casa", "btn-fora"); renderizarTudo(); });
$("btn-fora").addEventListener("click", () => { lado = "fora"; marcarAba("btn-fora", "btn-casa"); renderizarTudo(); });
function navegarRodadaAdmin(direcao) {
    const rodadas = rodadasDe(jogosDaCategoria());
    const atual = rodadas.indexOf(rodadaAtiva);
    const proximo = Math.max(0, Math.min(rodadas.length - 1, atual + direcao));
    if (rodadas[proximo]) { rodadaAtiva = rodadas[proximo]; renderizarTudo(); }
}
$("admin-rodada-anterior").addEventListener("click", () => navegarRodadaAdmin(-1));
$("admin-rodada-proxima").addEventListener("click", () => navegarRodadaAdmin(1));

$("sel-rodada").addEventListener("change", (e) => {
    rodadaAtiva = e.target.value;
    lado = "casa";
    marcarAba("btn-casa", "btn-fora");
    const primeiro = jogosDaRodada()[0];
    idJogo = primeiro ? primeiro.idJogo : null;
    renderizarTudo();
});
$("sel-jogo").addEventListener("change", (e) => { idJogo = parseInt(e.target.value, 10) || null; renderizarTudo(); });

// Finaliza o jogo somente quando uma equipe venceu 3 sets. O resultado salvo
// é consumido pela página pública para atualizar a classificação da Superliga.
$("resumo-jogo").addEventListener("click", (e) => {
    const botao = e.target.closest("#btn-finalizar-partida");
    if (!botao) return;
    const jogo = jogoAtual();
    const placar = calcularPlacarPontos(jogo);
    if (!jogo || !placar.encerrado || (placar.setsMandante !== 3 && placar.setsVisitante !== 3)) {
        alert("A partida só pode ser finalizada quando uma equipe vencer 3 sets.");
        return;
    }
    const casa = timesDaCategoria().find((t) => String(t.id) === String(jogo.idMandante));
    const fora = timesDaCategoria().find((t) => String(t.id) === String(jogo.idVisitante));
    const vencedor = placar.setsMandante === 3 ? casa : fora;
    if (!confirm(`Finalizar ${casa?.nome || "mandante"} ${placar.setsMandante} × ${placar.setsVisitante} ${fora?.nome || "visitante"}?\n\n${vencedor?.nome || "A equipe vencedora"} será registrada como vencedora e a classificação será atualizada.`)) return;

    const salvos = ler(K_JOGOS).filter((x) => String(x.idJogo) !== String(jogo.idJogo));
    salvos.push({
        idJogo: jogo.idJogo,
        categoria: jogo.categoria,
        idMandante: jogo.idMandante,
        idVisitante: jogo.idVisitante,
        setsMandante: placar.setsMandante,
        setsVisitante: placar.setsVisitante,
        jogado: true,
        finalizadoEm: new Date().toISOString()
    });
    if (!gravar(K_JOGOS, salvos)) return;
    nuvemEnfileirar({ t: "jogo", d: jogoParaLinha(salvos[salvos.length - 1]) });
    Object.assign(jogo, { setsMandante: placar.setsMandante, setsVisitante: placar.setsVisitante, jogado: true });
    renderizarTudo();
    alert("Partida finalizada! O resultado foi salvo e já conta na classificação deste navegador.");
});

// Cada toque num botão vira uma jogada
$("cards").addEventListener("click", (e) => {
    const stat = e.target.closest(".btn-stat");
    if (!stat) return;
    if (calcularPlacarPontos(jogoAtual()).encerrado) {
        alert("Esta partida já foi encerrada. Exclua uma jogada do histórico se precisar corrigir o placar.");
        return;
    }
    const nova = { id: novoId(), idJogo, idAtleta: stat.dataset.atleta, tipo: stat.dataset.tipo, ts: Date.now() };
    jogadas.push(nova);
    gravar(K_JOGADAS, jogadas);
    nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(nova) });
    if (navigator.vibrate) navigator.vibrate(30);   // feedback no celular
    renderizarTudo();
});

// Erro coletivo: registra um ponto para o adversário sem atribuir erro individual.
$("resumo-jogo").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-erro-time]");
    if (!botao) return;
    const jogo = jogoAtual();
    if (!jogo || calcularPlacarPontos(jogo).encerrado) return;
    const ladoErro = botao.dataset.erroTime;
    const idTime = ladoErro === "mandante" ? jogo.idMandante : jogo.idVisitante;
    const atletaTime = elencoDe(idTime)[0];
    if (!atletaTime) {
        alert("Esse time não tem atletas cadastradas. Cadastre ao menos uma atleta para registrar o erro coletivo.");
        return;
    }
    const nova = { id: novoId(), idJogo, idAtleta: atletaTime.id, tipo: "erro_time", ladoErro, ts: Date.now() };
    jogadas.push(nova);
    gravar(K_JOGADAS, jogadas);
    nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(nova) });
    renderizarTudo();
});

// Exclui apenas a jogada escolhida no histórico, sem alterar as demais.
$("log").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-remover-jogada]");
    if (!botao) return;
    const idRemover = botao.dataset.removerJogada;
    const jogada = jogadas.find((j) => String(j.id) === String(idRemover));
    if (!jogada) return;
    const atleta = atletas.find((a) => String(a.id) === String(jogada.idAtleta));
    const nome = atleta ? atleta.nome : "esta jogada";
    if (!confirm(`Excluir somente a jogada de ${nome}? O placar e as estatísticas serão recalculados.`)) return;
    jogadas = jogadas.filter((j) => String(j.id) !== String(idRemover));
    gravar(K_JOGADAS, jogadas);
    nuvemEnfileirar({ t: "jogada-del", id: String(idRemover) });
    invalidarResultadoSalvo(jogada.idJogo);
    renderizarTudo();
});

$("btn-desfazer").addEventListener("click", () => {
    for (let i = jogadas.length - 1; i >= 0; i--) {
        if (jogadas[i].idJogo === idJogo) {
            const idJogoAlterado = jogadas[i].idJogo;
            const idRemovida = jogadas[i].id;
            jogadas.splice(i, 1);
            gravar(K_JOGADAS, jogadas);
            nuvemEnfileirar({ t: "jogada-del", id: String(idRemovida) });
            invalidarResultadoSalvo(idJogoAlterado);
            renderizarTudo();
            return;
        }
    }
});

// Exclui todas as jogadas da partida selecionada.
$("btn-excluir-todas-jogadas").addEventListener("click", () => {
    const daPartida = jogadas.filter((j) => String(j.idJogo) === String(idJogo));
    if (!daPartida.length) { alert("Não há jogadas para excluir nesta partida."); return; }
    if (!confirm(`Excluir TODAS as ${daPartida.length} jogada(s) desta partida? O placar e as estatísticas serão recalculados.`)) return;
    const ids = new Set(daPartida.map((j) => String(j.id)));
    jogadas = jogadas.filter((j) => !ids.has(String(j.id)));
    gravar(K_JOGADAS, jogadas);
    daPartida.forEach((j) => nuvemEnfileirar({ t: "jogada-del", id: String(j.id) }));
    invalidarResultadoSalvo(idJogo);
    renderizarTudo();
});

// ===== LANÇAR PELO RESULTADO FINAL (jogo que não deu para acompanhar) =====
// Você informa as parciais dos sets e os pontos de cada atleta (match report). O sistema monta as
// jogadas sozinho, na ordem certa: o que sobrar de pontos de cada time entra como erro do adversário.
// Assim placar, sets, parciais, ranking e site público funcionam igual a um jogo lançado ao vivo.
let posJogoChave = null;   // jogo que está montado no formulário (evita apagar o que foi digitado)

const embaralharComSemente = (lista, semente) => {
    let s = Number(semente) || 1;
    const aleatorio = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    const r = lista.slice();
    for (let i = r.length - 1; i > 0; i--) { const k = Math.floor(aleatorio() * (i + 1));[r[i], r[k]] = [r[k], r[i]]; }
    return r;
};

function renderizarPosJogo(forcar) {
    const detalhes = $("pos-jogo");
    const jogo = jogoAtual();
    $("pos-jogo-secao").hidden = !jogo;
    if (!jogo || !detalhes.open) return;
    const chave = String(jogo.idJogo);
    if (!forcar && posJogoChave === chave) return;
    posJogoChave = chave;

    const times = timesDaCategoria();
    const casa = times.find((t) => String(t.id) === String(jogo.idMandante));
    const fora = times.find((t) => String(t.id) === String(jogo.idVisitante));
    const sets = calcularPlacarPontos(jogo).sets;
    const linhaSet = (i) => {
        const s = sets[i - 1];
        return `<div class="pos-set"><strong>Set ${i}${i === 5 ? " (vai a 15)" : ""}</strong>
            <input class="campo num" type="number" min="0" inputmode="numeric" data-parcial="${i}-m" value="${s ? s.mandante : ""}" aria-label="Set ${i} ${esc(casa?.nome || "mandante")}">
            <span>×</span>
            <input class="campo num" type="number" min="0" inputmode="numeric" data-parcial="${i}-v" value="${s ? s.visitante : ""}" aria-label="Set ${i} ${esc(fora?.nome || "visitante")}"></div>`;
    };
    const tabelaTime = (time, idTime) => `
        <h3 class="subtitulo">${esc(time?.nome || "Time")}</h3>
        <div class="tabela-wrap"><table class="tabela-pos">
            <thead><tr><th>Atleta</th>${STATS.map((s) => `<th>${esc(s.rotulo)}</th>`).join("")}</tr></thead>
            <tbody>${elencoDe(idTime).map((a) => `<tr><td>#${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</td>
                ${STATS.map((s) => { const n = contar(a.id, s.chave, jogo.idJogo); return `<td><input class="campo num" type="number" min="0" inputmode="numeric" data-atleta="${esc(a.id)}" data-tipo="${s.chave}" value="${n || ""}"></td>`; }).join("")}</tr>`).join("")}
            </tbody></table></div>`;

    $("pos-jogo-corpo").innerHTML = `
        <p class="dica">Digite as parciais dos sets (mandante × visitante) e os pontos de cada atleta conforme o match report.
        Os pontos que sobrarem em cada time entram como erros do adversário. Ao salvar, as jogadas atuais deste jogo são substituídas.</p>
        <h3 class="subtitulo">Parciais · ${esc(casa?.nome || "Mandante")} × ${esc(fora?.nome || "Visitante")}</h3>
        <div class="pos-sets">${[1, 2, 3, 4, 5].map(linhaSet).join("")}</div>
        ${tabelaTime(casa, jogo.idMandante)}${tabelaTime(fora, jogo.idVisitante)}
        <p id="pos-resumo" class="pos-resumo" role="status"></p>
        <button type="button" id="btn-salvar-pos-jogo" class="btn-salvar">Salvar jogo e atualizar classificação</button>`;
    atualizarResumoPosJogo();
}

// Lê e valida o formulário. Devolve { erro } ou os dados prontos para gerar as jogadas.
function lerPosJogo() {
    const jogo = jogoAtual();
    const corpo = $("pos-jogo-corpo");
    const valor = (el) => (el && el.value !== "" ? Number(el.value) : null);
    const parciais = [];
    const sets = { m: 0, v: 0 };
    let achouVazio = false;
    for (let i = 1; i <= 5; i++) {
        const m = valor(corpo.querySelector(`[data-parcial="${i}-m"]`));
        const v = valor(corpo.querySelector(`[data-parcial="${i}-v"]`));
        if (m === null && v === null) { achouVazio = true; continue; }
        if (achouVazio) return { erro: `Preencha os sets em ordem: o set ${i} está preenchido, mas há um set vazio antes dele.` };
        if (m === null || v === null || !Number.isInteger(m) || !Number.isInteger(v) || m < 0 || v < 0)
            return { erro: `Set ${i}: preencha os dois placares com números inteiros.` };
        if (sets.m === 3 || sets.v === 3) return { erro: `Set ${i}: o jogo já tinha terminado (uma equipe já tinha 3 sets).` };
        const alvo = i === 5 ? 15 : 25, maior = Math.max(m, v), dif = Math.abs(m - v);
        if (maior < alvo || dif < 2 || (maior > alvo && dif !== 2))
            return { erro: `Set ${i} (${m}x${v}) não é um placar válido: o set vai a ${alvo} pontos, com 2 de diferença.` };
        parciais.push({ numero: i, mandante: m, visitante: v, vencedor: m > v ? "mandante" : "visitante" });
        if (m > v) sets.m++; else sets.v++;
    }
    if (!parciais.length) return { vazio: true };
    if (sets.m !== 3 && sets.v !== 3) return { erro: "O jogo precisa ter um vencedor: uma equipe tem de chegar a 3 sets." };

    const pontosTime = { m: 0, v: 0 };
    parciais.forEach((p) => { pontosTime.m += p.mandante; pontosTime.v += p.visitante; });
    const contagens = [];
    const pontosAtletas = { m: 0, v: 0 };
    for (const el of corpo.querySelectorAll("[data-atleta]")) {
        const n = valor(el);
        if (n === null || n === 0) continue;
        if (!Number.isInteger(n) || n < 0) return { erro: "Os pontos das atletas precisam ser números inteiros, sem negativos." };
        const a = atletas.find((x) => String(x.id) === String(el.dataset.atleta));
        if (!a) continue;
        contagens.push({ idAtleta: a.id, tipo: el.dataset.tipo, n });
        if (tiposDePonto.includes(el.dataset.tipo)) pontosAtletas[String(a.idTime) === String(jogo.idMandante) ? "m" : "v"] += n;
    }
    // Pontos do time = pontos das atletas + erros do adversário
    const errosVisitante = pontosTime.m - pontosAtletas.m;   // erros do visitante que deram ponto ao mandante
    const errosMandante = pontosTime.v - pontosAtletas.v;
    return { parciais, sets, pontosTime, pontosAtletas, errosMandante, errosVisitante, contagens };
}

function atualizarResumoPosJogo() {
    const el = $("pos-resumo");
    if (!el) return;
    const jogo = jogoAtual();
    const times = timesDaCategoria();
    const nome = (id) => (times.find((t) => String(t.id) === String(id)) || {}).nome || "Time";
    const d = lerPosJogo();
    el.classList.remove("pos-erro");
    if (d.vazio) { el.textContent = "Informe as parciais dos sets para conferir o resultado."; return; }
    if (d.erro) { el.textContent = d.erro; el.classList.add("pos-erro"); return; }
    const linha = (idTime, pts, atl, err, doAdversario) =>
        `${nome(idTime)}: ${pts} pontos = ${atl} das atletas + ${err} erro(s) do ${nome(doAdversario)}`;
    const msg = `${nome(jogo.idMandante)} ${d.sets.m} × ${d.sets.v} ${nome(jogo.idVisitante)}. ` +
        linha(jogo.idMandante, d.pontosTime.m, d.pontosAtletas.m, d.errosVisitante, jogo.idVisitante) + ". " +
        linha(jogo.idVisitante, d.pontosTime.v, d.pontosAtletas.v, d.errosMandante, jogo.idMandante) + ".";
    if (d.errosVisitante < 0 || d.errosMandante < 0) {
        const quem = d.errosVisitante < 0 ? nome(jogo.idMandante) : nome(jogo.idVisitante);
        el.textContent = `${msg} Os pontos das atletas do ${quem} passam dos pontos do time nas parciais: confira os números.`;
        el.classList.add("pos-erro");
        return;
    }
    el.textContent = msg;
}

// Monta as jogadas na ordem certa para o placar reproduzir exatamente as parciais informadas.
function gerarJogadasPosJogo(jogo, d) {
    const elencoM = elencoDe(jogo.idMandante), elencoV = elencoDe(jogo.idVisitante);
    const montarPool = (lado) => {
        const idTime = lado === "m" ? jogo.idMandante : jogo.idVisitante;
        const adversario = lado === "m" ? elencoV : elencoM;
        const ladoAdversario = lado === "m" ? "visitante" : "mandante";
        const erros = lado === "m" ? d.errosVisitante : d.errosMandante;
        const pool = [];
        d.contagens
            .filter((c) => tiposDePonto.includes(c.tipo) && String((atletas.find((a) => String(a.id) === String(c.idAtleta)) || {}).idTime) === String(idTime))
            .forEach((c) => { for (let i = 0; i < c.n; i++) pool.push({ idAtleta: c.idAtleta, tipo: c.tipo }); });
        for (let i = 0; i < erros; i++) pool.push({ idAtleta: adversario[0].id, tipo: "erro_time", ladoErro: ladoAdversario });
        return embaralharComSemente(pool, Number(jogo.idJogo) * (lado === "m" ? 7 : 13));
    };
    const poolM = montarPool("m"), poolV = montarPool("v");
    const base = Date.now();
    const saida = [];
    for (const p of d.parciais) {
        const a = poolM.splice(0, p.mandante), b = poolV.splice(0, p.visitante);
        // alterna os pontos dos dois times; o vencedor do set fecha por último, sem encerrar o set antes da hora
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (i < a.length) saida.push(a[i]);
            if (i < b.length) saida.push(b[i]);
        }
    }
    return saida.map((x, i) => ({ id: novoId() + i.toString(36), idJogo: jogo.idJogo, ts: base + i, ...x }));
}

$("pos-jogo").addEventListener("toggle", () => renderizarPosJogo(false));
$("pos-jogo-corpo").addEventListener("input", atualizarResumoPosJogo);

$("pos-jogo-corpo").addEventListener("click", async (e) => {
    if (!e.target.closest("#btn-salvar-pos-jogo")) return;
    const jogo = jogoAtual();
    const d = lerPosJogo();
    if (!jogo || d.vazio) { alert("Informe as parciais dos sets antes de salvar."); return; }
    if (d.erro) { alert(d.erro); return; }
    if (d.errosMandante < 0 || d.errosVisitante < 0) { alert("Os pontos das atletas passam dos pontos do time nas parciais. Confira os números."); return; }
    if ((d.errosVisitante > 0 && !elencoDe(jogo.idVisitante).length) || (d.errosMandante > 0 && !elencoDe(jogo.idMandante).length)) {
        alert("Um dos times não tem atletas cadastradas para receber os erros do adversário."); return;
    }
    const novas = gerarJogadasPosJogo(jogo, d);
    // conferência de segurança: o placar das jogadas geradas tem de ser igual às parciais digitadas
    const conf = calcularPlacar(jogo, atletas, novas);
    const confere = conf.encerrado && conf.sets.length === d.parciais.length &&
        conf.sets.every((s, i) => s.mandante === d.parciais[i].mandante && s.visitante === d.parciais[i].visitante);
    if (!confere) { alert("Não foi possível montar as jogadas a partir desses números. Confira as parciais e os pontos das atletas."); return; }

    const casa = timesDaCategoria().find((t) => String(t.id) === String(jogo.idMandante));
    const fora = timesDaCategoria().find((t) => String(t.id) === String(jogo.idVisitante));
    const existentes = jogadas.filter((j) => String(j.idJogo) === String(jogo.idJogo));
    if (!confirm(`Salvar ${casa?.nome || "mandante"} ${d.sets.m} × ${d.sets.v} ${fora?.nome || "visitante"} (${d.parciais.map((p) => p.mandante + "x" + p.visitante).join(", ")})?` +
        (existentes.length ? `\n\nAs ${existentes.length} jogada(s) atuais deste jogo serão substituídas.` : "") +
        `\nO resultado entra na classificação.`)) return;

    // 1) neste navegador
    jogadas = jogadas.filter((j) => String(j.idJogo) !== String(jogo.idJogo)).concat(novas);
    gravar(K_JOGADAS, jogadas);
    const salvos = ler(K_JOGOS).filter((x) => String(x.idJogo) !== String(jogo.idJogo));
    salvos.push({
        idJogo: jogo.idJogo, categoria: jogo.categoria, idMandante: jogo.idMandante, idVisitante: jogo.idVisitante,
        setsMandante: d.sets.m, setsVisitante: d.sets.v, jogado: true, finalizadoEm: new Date().toISOString()
    });
    gravar(K_JOGOS, salvos);
    Object.assign(jogo, { setsMandante: d.sets.m, setsVisitante: d.sets.v, jogado: true });

    // 2) no Supabase
    existentes.forEach((j) => nuvemEnfileirar({ t: "jogada-del", id: String(j.id) }));
    let aviso = "";
    if (nuvem && (await nuvemUsuario())) {
        const erro = await enviarEmLotes("jogadas", novas.map(jogadaParaLinha), "id", 500);
        if (erro) { novas.forEach((j) => nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(j) })); aviso = "\n\nAs jogadas ficaram na fila de envio ao banco (" + erro + ")."; }
    } else {
        novas.forEach((j) => nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(j) }));
        aviso = "\n\nEntre na conta de administrador para enviar ao banco.";
    }
    nuvemEnfileirar({ t: "jogo", d: jogoParaLinha(salvos[salvos.length - 1]) });
    renderizarTudo();
    renderizarPosJogo(true);
    alert("Jogo salvo! Placar, parciais e pontuação das atletas foram atualizados." + aviso);
});

// ===== BACKUP =====
$("btn-exportar").addEventListener("click", () => {
    // Este arquivo é o que o site público lê: suba-o no GitHub com o nome dados.json
    const dados = { geradoEm: new Date().toISOString(), atletas, jogadas, jogos: ler(K_JOGOS).filter((j) => j.jogado) };
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
            if (!Array.isArray(d.atletas) || !Array.isArray(d.jogadas)) throw new Error("formato");
            if (!confirm(`Importar ${d.atletas.length} atletas e ${d.jogadas.length} jogadas? Isso SUBSTITUI os dados deste navegador.`)) return;
            atletas = d.atletas; jogadas = d.jogadas;
            gravar(K_ATLETAS, atletas); gravar(K_JOGADAS, jogadas);
            if (Array.isArray(d.jogos) && d.jogos.length) { gravar(K_JOGOS, d.jogos); jogos.splice(0, jogos.length, ...carregarJogos()); }
            limparForm();
            renderizarTudo();
            nuvemEnviarTudo().then((r) => alert(r.erro
                ? "Backup importado neste navegador, mas NÃO enviado ao banco: " + r.erro
                : `Backup importado e enviado ao banco (${r.jogadas} jogadas, ${r.jogos} resultados).`));
        } catch (err) { alert("Arquivo de backup inválido."); }
    };
    leitor.readAsText(arquivo);
    e.target.value = "";
});

// ===== LIMPEZA ÚNICA DOS ERROS INDIVIDUAIS =====
// O botão "Erro" de cada atleta foi removido. Aqui apagamos (uma única vez) os erros
// individuais já lançados em Gerdau Minas x Brusque, no navegador e no Supabase.
const K_LIMPEZA_ERROS = "volleyStats_limpeza_erros_individuais";
function limparErrosIndividuaisAntigos() {
    try { if (localStorage.getItem(K_LIMPEZA_ERROS)) return; } catch (e) { return; }
    const jogo = jogos.find((j) => j.categoria === "F" && String(j.idMandante) === "6" && String(j.idVisitante) === "3" && chaveRodada(j) === "T-1");
    if (!jogo) return;
    const antigas = jogadas.filter((j) => j.tipo === "erro" && String(j.idJogo) === String(jogo.idJogo));
    if (antigas.length) {
        const ids = new Set(antigas.map((j) => String(j.id)));
        jogadas = jogadas.filter((j) => !ids.has(String(j.id)));
        gravar(K_JOGADAS, jogadas);
        antigas.forEach((j) => nuvemEnfileirar({ t: "jogada-del", id: String(j.id) }));
    }
    try { localStorage.setItem(K_LIMPEZA_ERROS, "1"); } catch (e) { /* ignora */ }
}

// Importa SÓ a pontuação (jogadas + resultado do jogo) de um backup. Atletas e fotos não são mexidos.
// Erro individual antigo ("erro") entra como erro do time ("erro_time"): o ponto do adversário
// continua valendo, então o placar fica igual ao original.
$("arquivo-pontuacao").addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = async () => {
        try {
            const d = JSON.parse(leitor.result);
            if (!Array.isArray(d.jogadas)) throw new Error("formato");
            const novas = d.jogadas.map((j) => (j.tipo === "erro" ? { ...j, tipo: "erro_time" } : j));
            const idsJogos = new Set(novas.map((j) => String(j.idJogo)));
            const idsNovas = new Set(novas.map((j) => String(j.id)));
            const resultados = Array.isArray(d.jogos) ? d.jogos.filter((g) => g.jogado) : [];
            if (!confirm(`Importar ${novas.length} jogada(s) de ${idsJogos.size} jogo(s)` +
                (resultados.length ? ` e ${resultados.length} resultado(s)` : "") +
                `?\n\nAs jogadas atuais desses jogos serão substituídas. Atletas e fotos NÃO mudam.`)) return;

            // 1) neste navegador: troca as jogadas desses jogos
            const antigas = jogadas.filter((j) => idsJogos.has(String(j.idJogo)));
            jogadas = jogadas.filter((j) => !idsJogos.has(String(j.idJogo))).concat(novas);
            gravar(K_JOGADAS, jogadas);
            if (resultados.length) {
                const ids = new Set(resultados.map((g) => String(g.idJogo)));
                gravar(K_JOGOS, ler(K_JOGOS).filter((g) => !ids.has(String(g.idJogo))).concat(resultados));
                jogos.splice(0, jogos.length, ...carregarJogos());
            }

            // 2) no Supabase: apaga as antigas que não voltam e envia as novas
            antigas.filter((j) => !idsNovas.has(String(j.id)))
                .forEach((j) => nuvemEnfileirar({ t: "jogada-del", id: String(j.id) }));
            let aviso = "";
            if (nuvem && (await nuvemUsuario())) {
                const erro = await enviarEmLotes("jogadas", novas.map(jogadaParaLinha), "id", 500);
                if (erro) { novas.forEach((j) => nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(j) })); aviso = "\n\nAs jogadas ficam na fila de envio ao banco (" + erro + ")."; }
            } else {
                novas.forEach((j) => nuvemEnfileirar({ t: "jogada", d: jogadaParaLinha(j) }));
                aviso = "\n\nEntre na conta de administrador para enviar ao banco.";
            }
            resultados.forEach((g) => nuvemEnfileirar({ t: "jogo", d: jogoParaLinha(g) }));
            renderizarTudo();
            alert(`Pontuação importada: ${novas.length} jogada(s).` + aviso);
        } catch (err) { alert("Arquivo inválido."); }
    };
    leitor.readAsText(arquivo);
    e.target.value = "";
});

// ===== SINCRONIZAÇÃO COM O SUPABASE =====
// Envia o que está na fila e depois baixa o banco, que é a fonte oficial dos dados.
async function sincronizarDaNuvem() {
    if (!nuvem || !(await nuvemUsuario())) return;
    await nuvemProcessarFila();
    if (nuvemPendentes() > 0) return;   // sobrou pendência (ex.: sem internet): não sobrescreve o que está só aqui

    let dados = await nuvemBaixarTudo();
    if (dados.erro) { nuvemUltimoErro = dados.erro; document.dispatchEvent(new CustomEvent("nuvem-status")); return; }

    // Primeira vez neste navegador: se já há jogadas locais, pergunta antes de substituí-las
    const resultadosLocais = ler(K_JOGOS).filter((j) => j.jogado).length;
    if (!localStorage.getItem(K_NUVEM_OK) && (jogadas.length || resultadosLocais) &&
        confirm(`Este navegador tem ${jogadas.length} jogada(s) e ${resultadosLocais} resultado(s) que ainda não estão no banco.\n\nOK = enviar ao banco\nCancelar = descartar e usar só o que já está no banco`)) {
        const r = await nuvemEnviarTudo();
        if (r.erro) { alert("Não foi possível enviar: " + r.erro); return; }
        dados = await nuvemBaixarTudo();
        if (dados.erro) return;
    }
    try { localStorage.setItem(K_NUVEM_OK, "1"); } catch (e) { /* ignora */ }

    gravar(K_ATLETAS, dados.atletas);
    atletas = ler(K_ATLETAS);
    jogadas = dados.jogadas;
    gravar(K_JOGADAS, jogadas);
    gravar(K_JOGOS, dados.jogos);
    jogos.splice(0, jogos.length, ...carregarJogos());
    limparErrosIndividuaisAntigos();
    renderizarTudo();
    document.dispatchEvent(new CustomEvent("nuvem-status"));
}
document.addEventListener("nuvem-sincronizar", sincronizarDaNuvem);

// ===== INÍCIO =====
trocarCategoria("F");
sincronizarDaNuvem();