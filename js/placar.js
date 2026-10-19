"use strict";
// Cálculo do placar a partir das jogadas. Usado pelo admin E pelo site público,
// para os dois sempre mostrarem exatamente o mesmo placar.
// Regras: ataque, bloqueio e saque somam para o time da atleta; erro soma para o adversário.
// Sets 1 a 4 vão a 25 pontos e o 5º a 15, sempre com 2 de diferença. Vence quem fizer 3 sets.
// Precisa do STATS (atletas.js).

function calcularPlacar(jogo, atletas, jogadas) {
    const resultado = { mandante: 0, visitante: 0, setsMandante: 0, setsVisitante: 0,
        setAtual: 1, encerrado: false, ultimoSet: null };
    if (!jogo) return resultado;
    const porId = new Map(atletas.map((a) => [String(a.id), a]));
    const eventos = jogadas
        .map((x, i) => ({ ...x, __ordem: i }))
        .filter((x) => String(x.idJogo) === String(jogo.idJogo))
        .sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0) || a.__ordem - b.__ordem);

    for (const x of eventos) {
        const atleta = porId.get(String(x.idAtleta));
        if (!atleta || resultado.encerrado) continue;
        const ladoAtleta = String(atleta.idTime) === String(jogo.idMandante) ? 'mandante'
            : String(atleta.idTime) === String(jogo.idVisitante) ? 'visitante' : null;
        if (!ladoAtleta) continue;
        const stat = STATS.find((s) => s.chave === x.tipo);
        let ladoPonto = null;
        if (stat?.tipo === 'ponto') ladoPonto = ladoAtleta;
        else if (x.tipo === 'erro' || x.tipo === 'erro_time') ladoPonto = ladoAtleta === 'mandante' ? 'visitante' : 'mandante';
        if (!ladoPonto) continue;

        resultado[ladoPonto]++;
        const alvo = resultado.setAtual === 5 ? 15 : 25;
        const diferenca = Math.abs(resultado.mandante - resultado.visitante);
        if (Math.max(resultado.mandante, resultado.visitante) >= alvo && diferenca >= 2) {
            const vencedor = resultado.mandante > resultado.visitante ? 'mandante' : 'visitante';
            if (vencedor === 'mandante') resultado.setsMandante++;
            else resultado.setsVisitante++;
            resultado.ultimoSet = { numero: resultado.setAtual, mandante: resultado.mandante,
                visitante: resultado.visitante, vencedor };
            if (resultado.setsMandante === 3 || resultado.setsVisitante === 3) {
                resultado.encerrado = true;
            } else {
                resultado.setAtual++;
                resultado.mandante = 0;
                resultado.visitante = 0;
            }
        }
    }
    return resultado;
}
