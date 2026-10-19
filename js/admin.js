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
const erros = (idAtleta, jogo) => contar(idAtleta, "erro", jogo);

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
    const errosCasa = elencoDe(j.idMandante).reduce((s, a) => s + erros(a.id, idJogo), 0);
    const errosFora = elencoDe(j.idVisitante).reduce((s, a) => s + erros(a.id, idJogo), 0);
    const estadoSet = placar.encerrado ? "Partida encerrada" : `Set ${placar.setAtual}`;
    const setsResumo = `Sets: ${placar.setsMandante} – ${placar.setsVisitante}`;
    const notaFinal = j.jogado
        ? `<small class="partida-encerrada">Partida finalizada e contabilizada · ${setsResumo}</small>`
        : placar.encerrado
            ? `<small class="partida-encerrada">Fim de jogo · ${setsResumo}</small><button type="button" id="btn-finalizar-partida" class="btn-finalizar-partida">Finalizar partida e atualizar classificação</button>`
            : `<small class="sets-resumo">${setsResumo}</small>`;
    $("resumo-jogo").innerHTML = `
        <div class="placar-painel" role="status" aria-live="polite">
            <div class="placar-time casa">
                <span class="placar-selo">CASA</span>
                <strong class="placar-nome">${esc(casa ? casa.nome : "Mandante")}</strong>
                <span class="placar-pontos">${placar.mandante}</span>
                <small>${errosFora} erro(s) do adversário</small>
                <span class="sets-time">${placar.setsMandante} set(s)</span>
            </div>
            <div class="placar-centro"><span>${esc(estadoSet.toUpperCase())}</span><b>×</b><small>${setsResumo}</small></div>
            <div class="placar-time fora">
                <span class="placar-selo">FORA</span>
                <strong class="placar-nome">${esc(fora ? fora.nome : "Visitante")}</strong>
                <span class="placar-pontos">${placar.visitante}</span>
                <small>${errosCasa} erro(s) do adversário</small>
                <span class="sets-time">${placar.setsVisitante} set(s)</span>
            </div>
            <div class="erros-time-botoes">
                <button type="button" class="btn-erro-time" data-erro-time="mandante" ${placar.encerrado ? "disabled" : ""}>Erro — ${esc(casa ? casa.nome : "Mandante")}</button>
                <button type="button" class="btn-erro-time" data-erro-time="visitante" ${placar.encerrado ? "disabled" : ""}>Erro — ${esc(fora ? fora.nome : "Visitante")}</button>
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
                    <strong> #${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</strong>
                    <small>${esc(rotuloPosicao(a.posicao, categoria))}</small>
                </div>
                <span class="pts">${pontos(a.id, idJogo)} pts<br>${erros(a.id, idJogo)} erros</span>
            </div>
            <div class="botoes-stat">
                ${STATS.map((s) => `
                    <button class="btn-stat ${s.tipo}" data-atleta="${a.id}" data-tipo="${s.chave}" ${partidaEncerrada ? "disabled title=\"Partida encerrada\"" : ""}>
                        + ${s.rotulo}<small>${contar(a.id, s.chave, idJogo)}</small>
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
        .sort((x, y) => y.t.pontos - x.t.pontos || x.t.erro - y.t.erro)
        .map(({ a, t }) => `
            <tr>
                <td class="nome"><span class="time"><img class="foto-mini" src="${esc(fotoDe(a))}" alt="">
                     #${a.numero == null ? "—" : a.numero} ${esc(a.nome)}</span></td>
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
    $("atleta-posicao").innerHTML = '<option value="">Posição (opcional)</option>' +
        POSICOES.map((p) => `<option value="${p.chave}">${p[categoria]}</option>`).join("");
}

function renderizarTudo() {
    renderizarSeletorJogo(); renderizarResumo(); renderizarCards();
    renderizarLog(); renderizarListaElenco(); renderizarTabelaTemporada();
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
    renderizarTudo();
    document.dispatchEvent(new CustomEvent("nuvem-status"));
}
document.addEventListener("nuvem-sincronizar", sincronizarDaNuvem);

// ===== INÍCIO =====
trocarCategoria("F");
sincronizarDaNuvem();