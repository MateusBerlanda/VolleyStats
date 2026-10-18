"use strict";
// Placar ao vivo no site público (usa o Supabase Realtime).
// Ordem no HTML: atletas.js → supabase.js → dados-publicos.js → placar.js → ao-vivo.js → app.js.

// ===== PLACAR DAS PARTIDAS EM ANDAMENTO =====
// Devolve um Map(idJogo → placar) só para os jogos que já têm jogadas e ainda não foram finalizados.
function mapaAoVivo() {
    const vivos = new Map();
    const jogadas = ler(K_JOGADAS);
    if (!jogadas.length) return vivos;
    const atletas = ler(K_ATLETAS);
    const porJogo = new Map();
    jogadas.forEach((j) => {
        if (!porJogo.has(j.idJogo)) porJogo.set(j.idJogo, []);
        porJogo.get(j.idJogo).push(j);
    });
    porJogo.forEach((lista, idJogo) => {
        const jogo = jogosDaTemporada.find((x) => x.idJogo === idJogo);
        if (jogo && !jogo.jogado) vivos.set(idJogo, calcularPlacar(jogo, atletas, lista));
    });
    return vivos;
}

// ===== TEMPO REAL =====
// Aplica na memória uma mudança que chegou do banco (jogada ou resultado).
function aplicarMudanca(tabela, evento) {
    if (tabela === "jogadas") {
        const lista = DADOS_PUBLICOS[K_JOGADAS] || [];
        const id = (evento.eventType === "DELETE" ? evento.old : evento.new).id;
        const resto = lista.filter((j) => j.id !== id);
        DADOS_PUBLICOS[K_JOGADAS] = evento.eventType === "DELETE" ? resto : [...resto, linhaParaJogada(evento.new)];
    } else {
        const lista = DADOS_PUBLICOS[K_JOGOS] || [];
        const id = Number((evento.eventType === "DELETE" ? evento.old : evento.new).id_jogo);
        const resto = lista.filter((j) => j.idJogo !== id);
        DADOS_PUBLICOS[K_JOGOS] = evento.eventType === "DELETE" ? resto : [...resto, linhaParaJogo(evento.new)];
    }
}

// "aoMudar" é chamada (no máximo a cada 300 ms) quando chega qualquer mudança: o app.js redesenha a tela.
function iniciarAoVivo(aoMudar) {
    if (!nuvem || !FONTE_REMOTA) return;   // só funciona com os dados vindos do Supabase

    let espera = null;
    const avisar = () => { clearTimeout(espera); espera = setTimeout(aoMudar, 300); };

    ["jogadas", "jogos"].forEach((tabela) => {
        nuvem.channel("ao-vivo-" + tabela)
            .on("postgres_changes", { event: "*", schema: "public", table: tabela }, (evento) => {
                aplicarMudanca(tabela, evento);
                avisar();
            })
            .subscribe();
    });

    // Celular com a tela apagada pode perder a conexão: ao voltar para a aba, busca tudo de novo
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState !== "visible") return;
        await carregarDadosPublicos();
        avisar();
    });
}
