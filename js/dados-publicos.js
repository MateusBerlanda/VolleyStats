"use strict";
// Leitura dos dados públicos pelo Supabase. Usado só pelo index.html (o admin não carrega este arquivo).
// Ordem no HTML: atletas.js → supabase.js → dados-publicos.js → app.js.
//
// Ele troca duas funções do atletas.js:
//   carregarDadosPublicos(): busca no Supabase (se falhar, usa o dados.json como antes)
//   ler(): quando os dados vieram do Supabase, eles mandam e o localStorage do navegador é ignorado

let FONTE_REMOTA = false;                                  // true = dados vieram do Supabase
const lerDoNavegador = ler;                                // ler() original do atletas.js
const carregarDadosDoJson = carregarDadosPublicos;         // plano B original (dados.json)

ler = function (chave) {
    if (!FONTE_REMOTA) return lerDoNavegador(chave);
    const remoto = DADOS_PUBLICOS[chave] || [];
    if (chave !== K_ATLETAS) return remoto;
    // Atletas: elenco-base do código, com os dados do banco por cima (o banco manda)
    const porId = new Map(ATLETAS_BASE.map((a) => [a.id, { ...a }]));
    remoto.forEach((a) => porId.set(a.id, { ...porId.get(a.id), ...a }));
    return [...porId.values()];
};

carregarDadosPublicos = async function () {
    if (nuvem) {
        const d = await nuvemBaixarTudo();
        if (!d.erro) {
            DADOS_PUBLICOS[K_ATLETAS] = d.atletas;
            DADOS_PUBLICOS[K_JOGADAS] = d.jogadas;
            DADOS_PUBLICOS[K_JOGOS] = d.jogos;
            FONTE_REMOTA = true;
            return;
        }
        console.warn("Supabase indisponível, usando o dados.json:", d.erro);
    }
    return carregarDadosDoJson();
};
