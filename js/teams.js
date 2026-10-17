const tabelaSuperligaFeminina = [
    { id: 1, nome: "Batavo Mackenzie", logo: "img/mackenzie.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 2, nome: "Brasília Vôlei/BRB", logo: "img/brasilia.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 3, nome: "Brusque Vôlei", logo: "img/brusque.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 4, nome: "Dentil Praia Clube", logo: "img/praia.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 5, nome: "Fluminense F.C.", logo: "img/fluminense.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 6, nome: "Gerdau Minas", logo: "img/minas.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 7, nome: "Osasco São Cristóvão Saúde", logo: "img/osasco.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 8, nome: "Paulistano Barueri", logo: "img/barueri.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 9, nome: "E.C. Pinheiros", logo: "img/pinheiros.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 10, nome: "Sancor Seguros Vôlei", logo: "img/sancor.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 11, nome: "Sesc RJ Flamengo", logo: "img/flamengo.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 12, nome: "Sesi Vôlei Bauru", logo: "img/bauru.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 }
];

const tabelaSuperligaMasculina = [
    { id: 1, nome: "Sesi Bauru", logo: "img/bauruM.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 2, nome: "Vôlei Renata", logo: "img/renata.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 3, nome: "Sil Vôlei Guarulhos", logo: "img/guarulhos.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 4, nome: "Itambé Minas", logo: "img/itambe.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 5, nome: "Azulim/Sicoob/Monte", logo: "img/monte_carmelo.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 6, nome: "Montes Claros Vôlei", logo: "img/montes_claros.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 7, nome: "Norde Vôlei", logo: "img/norde.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 8, nome: "Praia Clube Uberlandia Vôlei", logo: "img/praiaM.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 9, nome: "Sada Cruzeiro Vôlei", logo: "img/cruzeiro.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 10, nome: "Saneago Goiás Vôlei", logo: "img/goias.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 11, nome: "Suzano Vôlei", logo: "img/suzano.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 },
    { id: 12, nome: "Viapol Vôlei São José", logo: "img/sao_jose.png", pontos: 0, vitorias: 0, derrotas: 0, setsGanhos: 0, setsPerdidos: 0 }
];

// ===== CALENDÁRIO DE JOGOS (fonte: site da CBV, Superliga 2026/27) =====
// Cada linha: [categoria, fase, rodada, data, hora, idMandante, idVisitante, local, aDefinir]
//   categoria "F"/"M" | fase "T" = Turno, "R" = Returno | data AAAA-MM-DD
//   aDefinir = true quando a CBV ainda não marcou data/horário (aparece como "Data a definir").
// Para ajustar um jogo (data, hora, local), edite só a linha dele.
// Os resultados lançados ficam salvos no navegador; o calendário vem sempre daqui.
const calendario = [
    // ---- FEMININO · Turno · Rodada 1 ----
    ["F", "T", 1, "2026-10-17", "18h30", 6, 3, "Arena Minas · Belo Horizonte"], // Gerdau Minas x Brusque Vôlei
    ["F", "T", 1, "2026-10-19", "18h30", 2, 7, "Ginásio FVDF · Brasília"], // Brasília Vôlei/BRB x Osasco São Cristóvão Saúde
    ["F", "T", 1, "2026-10-19", "18h30", 12, 1, "Arena Paulo Skaf · Bauru"], // Sesi Vôlei Bauru x Batavo Mackenzie
    ["F", "T", 1, "2026-10-19", "21h00", 11, 8, "Ginásio do TTC · Rio de Janeiro"], // Sesc RJ Flamengo x Paulistano Barueri
    ["F", "T", 1, "2026-10-20", "18h30", 5, 10, "Ginásio da Hebraica · Rio de Janeiro"], // Fluminense F.C. x Sancor Seguros Vôlei
    ["F", "T", 1, "2026-10-20", "21h00", 4, 9, "Ginásio do UTC · Uberlândia"], // Dentil Praia Clube x E.C. Pinheiros
    // ---- FEMININO · Turno · Rodada 2 ----
    ["F", "T", 2, "2026-10-23", "18h30", 2, 11, "Ginásio FVDF · Brasília"], // Brasília Vôlei/BRB x Sesc RJ Flamengo
    ["F", "T", 2, "2026-10-23", "18h30", 6, 8, "Arena Minas · Belo Horizonte"], // Gerdau Minas x Paulistano Barueri
    ["F", "T", 2, "2026-10-24", "16h00", 1, 7, "Ginásio do Mackenzie · Belo Horizonte"], // Batavo Mackenzie x Osasco São Cristóvão Saúde
    ["F", "T", 2, "2026-10-24", "21h00", 3, 4, "Arena Brusque · Brusque"], // Brusque Vôlei x Dentil Praia Clube
    ["F", "T", 2, "2026-10-26", "18h30", 10, 12, "Moringão · Londrina"], // Sancor Seguros Vôlei x Sesi Vôlei Bauru
    ["F", "T", 2, "2026-11-30", "18h30", 5, 9, ""], // Fluminense F.C. x E.C. Pinheiros
    // ---- FEMININO · Turno · Rodada 3 ----
    ["F", "T", 3, "2026-10-30", "18h30", 9, 3, "Ginásio do Pinheiros · São Paulo"], // E.C. Pinheiros x Brusque Vôlei
    ["F", "T", 3, "2026-10-30", "18h30", 4, 8, "Ginásio do UTC · Uberlândia"], // Dentil Praia Clube x Paulistano Barueri
    ["F", "T", 3, "2026-10-30", "21h00", 12, 5, "Arena Paulo Skaf · Bauru"], // Sesi Vôlei Bauru x Fluminense F.C.
    ["F", "T", 3, "2026-10-31", "16h00", 6, 2, "Arena Minas · Belo Horizonte"], // Gerdau Minas x Brasília Vôlei/BRB
    ["F", "T", 3, "2026-10-31", "18h30", 11, 1, "Maracanãzinho · Rio de Janeiro"], // Sesc RJ Flamengo x Batavo Mackenzie
    ["F", "T", 3, "2026-10-31", "21h00", 7, 10, "Ginásio José Liberatti · Osasco"], // Osasco São Cristóvão Saúde x Sancor Seguros Vôlei
    // ---- FEMININO · Turno · Rodada 4 ----
    ["F", "T", 4, "2026-11-05", "18h30", 1, 6, ""], // Batavo Mackenzie x Gerdau Minas
    ["F", "T", 4, "2026-11-06", "18h30", 10, 11, ""], // Sancor Seguros Vôlei x Sesc RJ Flamengo
    ["F", "T", 4, "2026-11-06", "21h00", 5, 7, ""], // Fluminense F.C. x Osasco São Cristóvão Saúde
    ["F", "T", 4, "2026-11-07", "18h30", 2, 4, ""], // Brasília Vôlei/BRB x Dentil Praia Clube
    ["F", "T", 4, "2026-11-07", "21h00", 12, 9, ""], // Sesi Vôlei Bauru x E.C. Pinheiros
    ["F", "T", 4, "2026-11-08", "11h00", 8, 3, ""], // Paulistano Barueri x Brusque Vôlei
    // ---- FEMININO · Turno · Rodada 5 ----
    ["F", "T", 5, "2026-11-12", "18h30", 6, 10, ""], // Gerdau Minas x Sancor Seguros Vôlei
    ["F", "T", 5, "2026-11-12", "18h30", 9, 8, ""], // E.C. Pinheiros x Paulistano Barueri
    ["F", "T", 5, "2026-11-12", "21h00", 11, 5, ""], // Sesc RJ Flamengo x Fluminense F.C.
    ["F", "T", 5, "2026-11-13", "18h30", 4, 1, ""], // Dentil Praia Clube x Batavo Mackenzie
    ["F", "T", 5, "2026-11-13", "21h00", 7, 12, ""], // Osasco São Cristóvão Saúde x Sesi Vôlei Bauru
    ["F", "T", 5, "2026-11-14", "21h00", 3, 2, ""], // Brusque Vôlei x Brasília Vôlei/BRB
    // ---- FEMININO · Turno · Rodada 6 ----
    ["F", "T", 6, "2026-11-17", "18h30", 5, 6, ""], // Fluminense F.C. x Gerdau Minas
    ["F", "T", 6, "2026-11-17", "21h00", 12, 11, ""], // Sesi Vôlei Bauru x Sesc RJ Flamengo
    ["F", "T", 6, "2026-11-18", "18h30", 8, 2, ""], // Paulistano Barueri x Brasília Vôlei/BRB
    ["F", "T", 6, "2026-11-18", "21h00", 10, 4, ""], // Sancor Seguros Vôlei x Dentil Praia Clube
    ["F", "T", 6, "2026-11-19", "18h30", 1, 3, ""], // Batavo Mackenzie x Brusque Vôlei
    ["F", "T", 6, "2026-11-19", "19h30", 7, 9, ""], // Osasco São Cristóvão Saúde x E.C. Pinheiros
    // ---- FEMININO · Turno · Rodada 7 ----
    ["F", "T", 7, "2026-11-23", "18h30", 6, 12, ""], // Gerdau Minas x Sesi Vôlei Bauru
    ["F", "T", 7, "2026-11-23", "21h00", 11, 7, ""], // Sesc RJ Flamengo x Osasco São Cristóvão Saúde
    ["F", "T", 7, "2026-11-24", "18h30", 2, 9, ""], // Brasília Vôlei/BRB x E.C. Pinheiros
    ["F", "T", 7, "2026-11-24", "21h00", 4, 5, ""], // Dentil Praia Clube x Fluminense F.C.
    ["F", "T", 7, "2026-11-25", "18h30", 8, 1, ""], // Paulistano Barueri x Batavo Mackenzie
    ["F", "T", 7, "2026-12-01", "18h30", 3, 10, ""], // Brusque Vôlei x Sancor Seguros Vôlei
    // ---- FEMININO · Turno · Rodada 8 ----
    ["F", "T", 8, "2026-12-03", "21h00", 11, 9, ""], // Sesc RJ Flamengo x E.C. Pinheiros
    ["F", "T", 8, "2026-12-04", "18h30", 1, 2, ""], // Batavo Mackenzie x Brasília Vôlei/BRB
    ["F", "T", 8, "2026-12-04", "18h30", 12, 4, ""], // Sesi Vôlei Bauru x Dentil Praia Clube
    ["F", "T", 8, "2026-12-04", "21h00", 7, 6, ""], // Osasco São Cristóvão Saúde x Gerdau Minas
    ["F", "T", 8, "2026-12-05", "16h00", 10, 8, ""], // Sancor Seguros Vôlei x Paulistano Barueri
    ["F", "T", 8, "2026-12-05", "18h30", 5, 3, ""], // Fluminense F.C. x Brusque Vôlei
    // ---- FEMININO · Turno · Rodada 9 ----
    ["F", "T", 9, "2026-11-27", "18h30", 4, 7, ""], // Dentil Praia Clube x Osasco São Cristóvão Saúde
    ["F", "T", 9, "2026-12-08", "18h30", 1, 9, ""], // Batavo Mackenzie x E.C. Pinheiros
    ["F", "T", 9, "2026-12-08", "21h00", 6, 11, ""], // Gerdau Minas x Sesc RJ Flamengo
    ["F", "T", 9, "2026-12-09", "18h30", 2, 10, ""], // Brasília Vôlei/BRB x Sancor Seguros Vôlei
    ["F", "T", 9, "2026-12-09", "21h00", 8, 5, ""], // Paulistano Barueri x Fluminense F.C.
    ["F", "T", 9, "2026-12-22", "18h30", 3, 12, ""], // Brusque Vôlei x Sesi Vôlei Bauru
    // ---- FEMININO · Turno · Rodada 10 ----
    ["F", "T", 10, "2026-11-03", "18h30", 8, 12, "Sportville · São Paulo"], // Paulistano Barueri x Sesi Vôlei Bauru
    ["F", "T", 10, "2026-12-12", "21h00", 9, 6, ""], // E.C. Pinheiros x Gerdau Minas
    ["F", "T", 10, "2026-12-14", "18h30", 5, 2, ""], // Fluminense F.C. x Brasília Vôlei/BRB
    ["F", "T", 10, "2026-12-14", "21h00", 11, 4, ""], // Sesc RJ Flamengo x Dentil Praia Clube
    ["F", "T", 10, "2026-12-15", "18h30", 10, 1, ""], // Sancor Seguros Vôlei x Batavo Mackenzie
    ["F", "T", 10, "2026-12-16", "21h00", 7, 3, ""], // Osasco São Cristóvão Saúde x Brusque Vôlei
    // ---- FEMININO · Turno · Rodada 11 ----
    ["F", "T", 11, "2026-12-18", "21h00", 2, 12, ""], // Brasília Vôlei/BRB x Sesi Vôlei Bauru
    ["F", "T", 11, "2026-12-19", "16h00", 1, 5, ""], // Batavo Mackenzie x Fluminense F.C.
    ["F", "T", 11, "2026-12-19", "18h30", 3, 11, ""], // Brusque Vôlei x Sesc RJ Flamengo
    ["F", "T", 11, "2026-12-19", "21h00", 8, 7, ""], // Paulistano Barueri x Osasco São Cristóvão Saúde
    ["F", "T", 11, "2026-12-20", "11h00", 9, 10, ""], // E.C. Pinheiros x Sancor Seguros Vôlei
    ["F", "T", 11, "2026-12-21", "21h00", 6, 4, ""], // Gerdau Minas x Dentil Praia Clube
    // ---- FEMININO · Returno · Rodada 1 ----
    ["F", "R", 1, "2026-12-22", "19h00", 10, 5, "", true], // Sancor Seguros Vôlei x Fluminense F.C.
    ["F", "R", 1, "2026-12-22", "19h00", 3, 6, "", true], // Brusque Vôlei x Gerdau Minas
    ["F", "R", 1, "2026-12-22", "19h00", 8, 11, "", true], // Paulistano Barueri x Sesc RJ Flamengo
    ["F", "R", 1, "2026-12-22", "19h00", 2, 7, "Ginásio FVDF · Brasília", true], // Brasília Vôlei/BRB x Osasco São Cristóvão Saúde
    ["F", "R", 1, "2026-12-22", "19h00", 1, 12, "", true], // Batavo Mackenzie x Sesi Vôlei Bauru
    ["F", "R", 1, "2026-12-22", "19h00", 9, 4, "", true], // E.C. Pinheiros x Dentil Praia Clube
    // ---- FEMININO · Returno · Rodada 2 ----
    ["F", "R", 2, "2026-12-22", "19h00", 9, 5, "", true], // E.C. Pinheiros x Fluminense F.C.
    ["F", "R", 2, "2026-12-22", "19h00", 7, 1, "", true], // Osasco São Cristóvão Saúde x Batavo Mackenzie
    ["F", "R", 2, "2026-12-22", "19h00", 11, 2, "", true], // Sesc RJ Flamengo x Brasília Vôlei/BRB
    ["F", "R", 2, "2026-12-22", "19h00", 4, 3, "", true], // Dentil Praia Clube x Brusque Vôlei
    ["F", "R", 2, "2026-12-22", "19h00", 12, 10, "", true], // Sesi Vôlei Bauru x Sancor Seguros Vôlei
    ["F", "R", 2, "2026-12-22", "19h00", 8, 6, "", true], // Paulistano Barueri x Gerdau Minas
    // ---- FEMININO · Returno · Rodada 3 ----
    ["F", "R", 3, "2026-12-22", "19h00", 3, 9, "", true], // Brusque Vôlei x E.C. Pinheiros
    ["F", "R", 3, "2026-12-22", "19h00", 8, 4, "", true], // Paulistano Barueri x Dentil Praia Clube
    ["F", "R", 3, "2026-12-22", "19h00", 2, 6, "", true], // Brasília Vôlei/BRB x Gerdau Minas
    ["F", "R", 3, "2026-12-22", "19h00", 5, 12, "", true], // Fluminense F.C. x Sesi Vôlei Bauru
    ["F", "R", 3, "2026-12-22", "19h00", 1, 11, "", true], // Batavo Mackenzie x Sesc RJ Flamengo
    ["F", "R", 3, "2026-12-22", "19h00", 10, 7, "", true], // Sancor Seguros Vôlei x Osasco São Cristóvão Saúde
    // ---- FEMININO · Returno · Rodada 4 ----
    ["F", "R", 4, "2026-12-22", "19h00", 9, 12, "", true], // E.C. Pinheiros x Sesi Vôlei Bauru
    ["F", "R", 4, "2026-12-22", "19h00", 3, 8, "", true], // Brusque Vôlei x Paulistano Barueri
    ["F", "R", 4, "2026-12-22", "19h00", 7, 5, "", true], // Osasco São Cristóvão Saúde x Fluminense F.C.
    ["F", "R", 4, "2026-12-22", "19h00", 11, 10, "", true], // Sesc RJ Flamengo x Sancor Seguros Vôlei
    ["F", "R", 4, "2026-12-22", "19h00", 6, 1, "", true], // Gerdau Minas x Batavo Mackenzie
    ["F", "R", 4, "2026-12-22", "19h00", 4, 2, "", true], // Dentil Praia Clube x Brasília Vôlei/BRB
    // ---- FEMININO · Returno · Rodada 5 ----
    ["F", "R", 5, "2026-12-22", "19h00", 8, 9, "", true], // Paulistano Barueri x E.C. Pinheiros
    ["F", "R", 5, "2026-12-22", "19h00", 10, 6, "", true], // Sancor Seguros Vôlei x Gerdau Minas
    ["F", "R", 5, "2026-12-22", "19h00", 2, 3, "", true], // Brasília Vôlei/BRB x Brusque Vôlei
    ["F", "R", 5, "2026-12-22", "19h00", 5, 11, "", true], // Fluminense F.C. x Sesc RJ Flamengo
    ["F", "R", 5, "2026-12-22", "19h00", 12, 7, "", true], // Sesi Vôlei Bauru x Osasco São Cristóvão Saúde
    ["F", "R", 5, "2026-12-22", "19h00", 1, 4, "", true], // Batavo Mackenzie x Dentil Praia Clube
    // ---- FEMININO · Returno · Rodada 6 ----
    ["F", "R", 6, "2026-12-22", "19h00", 9, 7, "", true], // E.C. Pinheiros x Osasco São Cristóvão Saúde
    ["F", "R", 6, "2026-12-22", "19h00", 3, 1, "", true], // Brusque Vôlei x Batavo Mackenzie
    ["F", "R", 6, "2026-12-22", "19h00", 11, 12, "", true], // Sesc RJ Flamengo x Sesi Vôlei Bauru
    ["F", "R", 6, "2026-12-22", "19h00", 2, 8, "", true], // Brasília Vôlei/BRB x Paulistano Barueri
    ["F", "R", 6, "2026-12-22", "19h00", 6, 5, "", true], // Gerdau Minas x Fluminense F.C.
    ["F", "R", 6, "2026-12-22", "19h00", 4, 10, "", true], // Dentil Praia Clube x Sancor Seguros Vôlei
    // ---- FEMININO · Returno · Rodada 7 ----
    ["F", "R", 7, "2026-12-22", "19h00", 7, 11, "", true], // Osasco São Cristóvão Saúde x Sesc RJ Flamengo
    ["F", "R", 7, "2026-12-22", "19h00", 10, 3, "", true], // Sancor Seguros Vôlei x Brusque Vôlei
    ["F", "R", 7, "2026-12-22", "19h00", 5, 4, "", true], // Fluminense F.C. x Dentil Praia Clube
    ["F", "R", 7, "2026-12-22", "19h00", 9, 2, "", true], // E.C. Pinheiros x Brasília Vôlei/BRB
    ["F", "R", 7, "2026-12-22", "19h00", 12, 6, "", true], // Sesi Vôlei Bauru x Gerdau Minas
    ["F", "R", 7, "2026-12-22", "19h00", 1, 8, "", true], // Batavo Mackenzie x Paulistano Barueri
    // ---- FEMININO · Returno · Rodada 8 ----
    ["F", "R", 8, "2026-12-22", "19h00", 4, 12, "", true], // Dentil Praia Clube x Sesi Vôlei Bauru
    ["F", "R", 8, "2026-12-22", "19h00", 2, 1, "", true], // Brasília Vôlei/BRB x Batavo Mackenzie
    ["F", "R", 8, "2026-12-22", "19h00", 11, 9, "", true], // Sesc RJ Flamengo x E.C. Pinheiros
    ["F", "R", 8, "2026-12-22", "19h00", 3, 5, "", true], // Brusque Vôlei x Fluminense F.C.
    ["F", "R", 8, "2026-12-22", "19h00", 6, 7, "", true], // Gerdau Minas x Osasco São Cristóvão Saúde
    ["F", "R", 8, "2026-12-22", "19h00", 8, 10, "", true], // Paulistano Barueri x Sancor Seguros Vôlei
    // ---- FEMININO · Returno · Rodada 9 ----
    ["F", "R", 9, "2026-12-22", "19h00", 5, 8, "", true], // Fluminense F.C. x Paulistano Barueri
    ["F", "R", 9, "2026-12-22", "19h00", 11, 6, "", true], // Sesc RJ Flamengo x Gerdau Minas
    ["F", "R", 9, "2026-12-22", "19h00", 9, 1, "", true], // E.C. Pinheiros x Batavo Mackenzie
    ["F", "R", 9, "2026-12-22", "19h00", 12, 3, "", true], // Sesi Vôlei Bauru x Brusque Vôlei
    ["F", "R", 9, "2026-12-22", "19h00", 7, 4, "", true], // Osasco São Cristóvão Saúde x Dentil Praia Clube
    ["F", "R", 9, "2026-12-22", "19h00", 10, 2, "", true], // Sancor Seguros Vôlei x Brasília Vôlei/BRB
    // ---- FEMININO · Returno · Rodada 10 ----
    ["F", "R", 10, "2026-12-22", "19h00", 3, 7, "", true], // Brusque Vôlei x Osasco São Cristóvão Saúde
    ["F", "R", 10, "2026-12-22", "19h00", 2, 5, "", true], // Brasília Vôlei/BRB x Fluminense F.C.
    ["F", "R", 10, "2026-12-22", "19h00", 6, 9, "", true], // Gerdau Minas x E.C. Pinheiros
    ["F", "R", 10, "2026-12-22", "19h00", 4, 11, "", true], // Dentil Praia Clube x Sesc RJ Flamengo
    ["F", "R", 10, "2026-12-22", "19h00", 8, 12, "Sportville · São Paulo", true], // Paulistano Barueri x Sesi Vôlei Bauru
    ["F", "R", 10, "2026-12-22", "19h00", 1, 10, "", true], // Batavo Mackenzie x Sancor Seguros Vôlei
    // ---- FEMININO · Returno · Rodada 11 ----
    ["F", "R", 11, "2026-12-22", "19h00", 10, 9, "", true], // Sancor Seguros Vôlei x E.C. Pinheiros
    ["F", "R", 11, "2026-12-22", "19h00", 5, 1, "", true], // Fluminense F.C. x Batavo Mackenzie
    ["F", "R", 11, "2026-12-22", "19h00", 12, 2, "", true], // Sesi Vôlei Bauru x Brasília Vôlei/BRB
    ["F", "R", 11, "2026-12-22", "19h00", 7, 8, "", true], // Osasco São Cristóvão Saúde x Paulistano Barueri
    ["F", "R", 11, "2026-12-22", "19h00", 11, 3, "", true], // Sesc RJ Flamengo x Brusque Vôlei
    ["F", "R", 11, "2026-12-22", "19h00", 4, 6, "", true], // Dentil Praia Clube x Gerdau Minas
    // ---- MASCULINO · Turno · Rodada 1 ----
    ["M", "T", 1, "2026-10-24", "18h30", 3, 5, "Ginásio da Ponte Grande · Guarulhos"], // Sil Vôlei Guarulhos x Azulim/Sicoob/Monte
    ["M", "T", 1, "2026-10-26", "19h00", 6, 9, "Ginásio Tancredo Neves (Caldeirão) · Montes Claros"], // Montes Claros Vôlei x Sada Cruzeiro Vôlei
    ["M", "T", 1, "2026-10-26", "21h00", 7, 2, "Arena Multiuso CFO · Fortaleza"], // Norde Vôlei x Vôlei Renata
    ["M", "T", 1, "2026-10-27", "18h30", 11, 10, "Arena Suzano · Suzano"], // Suzano Vôlei x Saneago Goiás Vôlei
    ["M", "T", 1, "2026-10-27", "21h00", 8, 12, "Ginásio do UTC · Uberlândia"], // Praia Clube Uberlandia Vôlei x Viapol Vôlei São José
    ["M", "T", 1, "2026-10-28", "21h00", 4, 1, "Arena Minas · Belo Horizonte"], // Itambé Minas x Sesi Bauru
    // ---- MASCULINO · Turno · Rodada 2 ----
    ["M", "T", 2, "2026-11-02", "16h00", 6, 7, ""], // Montes Claros Vôlei x Norde Vôlei
    ["M", "T", 2, "2026-11-02", "18h30", 1, 8, ""], // Sesi Bauru x Praia Clube Uberlandia Vôlei
    ["M", "T", 2, "2026-11-02", "21h00", 3, 9, ""], // Sil Vôlei Guarulhos x Sada Cruzeiro Vôlei
    ["M", "T", 2, "2026-11-03", "18h30", 10, 4, ""], // Saneago Goiás Vôlei x Itambé Minas
    ["M", "T", 2, "2026-11-03", "21h00", 12, 2, ""], // Viapol Vôlei São José x Vôlei Renata
    ["M", "T", 2, "2026-11-03", "21h00", 5, 11, ""], // Azulim/Sicoob/Monte x Suzano Vôlei
    // ---- MASCULINO · Turno · Rodada 3 ----
    ["M", "T", 3, "2026-11-09", "18h30", 4, 5, ""], // Itambé Minas x Azulim/Sicoob/Monte
    ["M", "T", 3, "2026-11-09", "21h00", 2, 1, ""], // Vôlei Renata x Sesi Bauru
    ["M", "T", 3, "2026-11-10", "18h30", 12, 6, ""], // Viapol Vôlei São José x Montes Claros Vôlei
    ["M", "T", 3, "2026-11-10", "21h00", 7, 9, ""], // Norde Vôlei x Sada Cruzeiro Vôlei
    ["M", "T", 3, "2026-11-11", "18h30", 8, 10, ""], // Praia Clube Uberlandia Vôlei x Saneago Goiás Vôlei
    ["M", "T", 3, "2026-11-11", "21h00", 11, 3, ""], // Suzano Vôlei x Sil Vôlei Guarulhos
    // ---- MASCULINO · Turno · Rodada 4 ----
    ["M", "T", 4, "2026-11-14", "16h00", 7, 12, ""], // Norde Vôlei x Viapol Vôlei São José
    ["M", "T", 4, "2026-11-14", "18h30", 6, 1, ""], // Montes Claros Vôlei x Sesi Bauru
    ["M", "T", 4, "2026-11-15", "11h00", 5, 8, ""], // Azulim/Sicoob/Monte x Praia Clube Uberlandia Vôlei
    ["M", "T", 4, "2026-11-16", "18h30", 10, 2, ""], // Saneago Goiás Vôlei x Vôlei Renata
    ["M", "T", 4, "2026-11-16", "18h30", 3, 4, ""], // Sil Vôlei Guarulhos x Itambé Minas
    ["M", "T", 4, "2026-11-16", "21h00", 9, 11, ""], // Sada Cruzeiro Vôlei x Suzano Vôlei
    // ---- MASCULINO · Turno · Rodada 5 ----
    ["M", "T", 5, "2026-11-20", "18h30", 2, 5, ""], // Vôlei Renata x Azulim/Sicoob/Monte
    ["M", "T", 5, "2026-11-20", "18h30", 10, 6, ""], // Saneago Goiás Vôlei x Montes Claros Vôlei
    ["M", "T", 5, "2026-11-20", "21h00", 8, 3, ""], // Praia Clube Uberlandia Vôlei x Sil Vôlei Guarulhos
    ["M", "T", 5, "2026-11-21", "16h00", 12, 9, ""], // Viapol Vôlei São José x Sada Cruzeiro Vôlei
    ["M", "T", 5, "2026-11-21", "18h30", 11, 4, ""], // Suzano Vôlei x Itambé Minas
    ["M", "T", 5, "2026-11-23", "18h30", 1, 7, ""], // Sesi Bauru x Norde Vôlei
    // ---- MASCULINO · Turno · Rodada 6 ----
    ["M", "T", 6, "2026-11-27", "18h30", 1, 12, ""], // Sesi Bauru x Viapol Vôlei São José
    ["M", "T", 6, "2026-11-27", "21h00", 9, 4, ""], // Sada Cruzeiro Vôlei x Itambé Minas
    ["M", "T", 6, "2026-11-27", "21h00", 7, 10, ""], // Norde Vôlei x Saneago Goiás Vôlei
    ["M", "T", 6, "2026-11-28", "16h00", 6, 5, ""], // Montes Claros Vôlei x Azulim/Sicoob/Monte
    ["M", "T", 6, "2026-11-28", "18h30", 3, 2, ""], // Sil Vôlei Guarulhos x Vôlei Renata
    ["M", "T", 6, "2026-11-28", "21h00", 11, 8, ""], // Suzano Vôlei x Praia Clube Uberlandia Vôlei
    // ---- MASCULINO · Turno · Rodada 7 ----
    ["M", "T", 7, "2026-12-01", "18h30", 2, 11, ""], // Vôlei Renata x Suzano Vôlei
    ["M", "T", 7, "2026-12-01", "21h00", 9, 1, ""], // Sada Cruzeiro Vôlei x Sesi Bauru
    ["M", "T", 7, "2026-12-02", "18h30", 5, 7, ""], // Azulim/Sicoob/Monte x Norde Vôlei
    ["M", "T", 7, "2026-12-02", "18h30", 8, 4, ""], // Praia Clube Uberlandia Vôlei x Itambé Minas
    ["M", "T", 7, "2026-12-02", "21h00", 10, 12, ""], // Saneago Goiás Vôlei x Viapol Vôlei São José
    ["M", "T", 7, "2026-12-03", "18h30", 6, 3, ""], // Montes Claros Vôlei x Sil Vôlei Guarulhos
    // ---- MASCULINO · Turno · Rodada 8 ----
    ["M", "T", 8, "2026-12-06", "11h00", 12, 5, ""], // Viapol Vôlei São José x Azulim/Sicoob/Monte
    ["M", "T", 8, "2026-12-06", "16h00", 1, 10, ""], // Sesi Bauru x Saneago Goiás Vôlei
    ["M", "T", 8, "2026-12-07", "18h30", 9, 8, ""], // Sada Cruzeiro Vôlei x Praia Clube Uberlandia Vôlei
    ["M", "T", 8, "2026-12-07", "21h00", 4, 2, ""], // Itambé Minas x Vôlei Renata
    ["M", "T", 8, "2026-12-08", "18h30", 11, 6, ""], // Suzano Vôlei x Montes Claros Vôlei
    ["M", "T", 8, "2026-12-08", "18h30", 3, 7, ""], // Sil Vôlei Guarulhos x Norde Vôlei
    // ---- MASCULINO · Turno · Rodada 9 ----
    ["M", "T", 9, "2026-12-10", "19h30", 9, 10, ""], // Sada Cruzeiro Vôlei x Saneago Goiás Vôlei
    ["M", "T", 9, "2026-12-11", "18h30", 2, 8, ""], // Vôlei Renata x Praia Clube Uberlandia Vôlei
    ["M", "T", 9, "2026-12-11", "18h30", 6, 4, ""], // Montes Claros Vôlei x Itambé Minas
    ["M", "T", 9, "2026-12-11", "21h00", 5, 1, ""], // Azulim/Sicoob/Monte x Sesi Bauru
    ["M", "T", 9, "2026-12-11", "21h00", 11, 7, ""], // Suzano Vôlei x Norde Vôlei
    ["M", "T", 9, "2026-12-12", "18h30", 3, 12, ""], // Sil Vôlei Guarulhos x Viapol Vôlei São José
    // ---- MASCULINO · Turno · Rodada 10 ----
    ["M", "T", 10, "2026-10-29", "19h00", 9, 5, "Riachão · Contagem"], // Sada Cruzeiro Vôlei x Azulim/Sicoob/Monte
    ["M", "T", 10, "2026-11-25", "18h30", 6, 2, ""], // Montes Claros Vôlei x Vôlei Renata
    ["M", "T", 10, "2026-12-16", "18h30", 4, 12, ""], // Itambé Minas x Viapol Vôlei São José
    ["M", "T", 10, "2026-12-17", "18h30", 7, 8, ""], // Norde Vôlei x Praia Clube Uberlandia Vôlei
    ["M", "T", 10, "2026-12-17", "18h30", 1, 11, ""], // Sesi Bauru x Suzano Vôlei
    ["M", "T", 10, "2026-12-17", "21h00", 10, 3, ""], // Saneago Goiás Vôlei x Sil Vôlei Guarulhos
    // ---- MASCULINO · Turno · Rodada 11 ----
    ["M", "T", 11, "2026-11-13", "18h30", 2, 9, ""], // Vôlei Renata x Sada Cruzeiro Vôlei
    ["M", "T", 11, "2026-12-21", "18h30", 5, 10, ""], // Azulim/Sicoob/Monte x Saneago Goiás Vôlei
    ["M", "T", 11, "2026-12-21", "18h30", 8, 6, ""], // Praia Clube Uberlandia Vôlei x Montes Claros Vôlei
    ["M", "T", 11, "2026-12-22", "21h00", 7, 4, ""], // Norde Vôlei x Itambé Minas
    ["M", "T", 11, "2026-12-23", "18h30", 12, 11, ""], // Viapol Vôlei São José x Suzano Vôlei
    ["M", "T", 11, "2026-12-23", "18h30", 3, 1, ""], // Sil Vôlei Guarulhos x Sesi Bauru
    // ---- MASCULINO · Returno · Rodada 1 ----
    ["M", "R", 1, "2026-12-29", "18h30", 10, 11, ""], // Saneago Goiás Vôlei x Suzano Vôlei
    ["M", "R", 1, "2026-12-29", "21h00", 12, 8, ""], // Viapol Vôlei São José x Praia Clube Uberlandia Vôlei
    ["M", "R", 1, "2026-12-30", "18h30", 9, 6, ""], // Sada Cruzeiro Vôlei x Montes Claros Vôlei
    ["M", "R", 1, "2026-12-30", "21h00", 7, 2, "Arena Multiuso CFO · Fortaleza"], // Norde Vôlei x Vôlei Renata
    ["M", "R", 1, "2027-01-12", "00h00", 1, 4, "", true], // Sesi Bauru x Itambé Minas
    ["M", "R", 1, "2027-01-12", "18h30", 5, 3, ""], // Azulim/Sicoob/Monte x Sil Vôlei Guarulhos
    // ---- MASCULINO · Returno · Rodada 2 ----
    ["M", "R", 2, "2027-01-04", "16h00", 7, 6, ""], // Norde Vôlei x Montes Claros Vôlei
    ["M", "R", 2, "2027-01-04", "18h30", 8, 1, ""], // Praia Clube Uberlandia Vôlei x Sesi Bauru
    ["M", "R", 2, "2027-01-04", "21h00", 9, 3, ""], // Sada Cruzeiro Vôlei x Sil Vôlei Guarulhos
    ["M", "R", 2, "2027-01-05", "18h30", 4, 10, ""], // Itambé Minas x Saneago Goiás Vôlei
    ["M", "R", 2, "2027-01-05", "21h00", 2, 12, ""], // Vôlei Renata x Viapol Vôlei São José
    ["M", "R", 2, "2027-01-06", "18h30", 11, 5, ""], // Suzano Vôlei x Azulim/Sicoob/Monte
    // ---- MASCULINO · Returno · Rodada 3 ----
    ["M", "R", 3, "2027-01-11", "18h30", 3, 11, ""], // Sil Vôlei Guarulhos x Suzano Vôlei
    ["M", "R", 3, "2027-01-11", "21h00", 1, 2, ""], // Sesi Bauru x Vôlei Renata
    ["M", "R", 3, "2027-01-12", "18h30", 6, 12, ""], // Montes Claros Vôlei x Viapol Vôlei São José
    ["M", "R", 3, "2027-01-12", "21h00", 9, 7, ""], // Sada Cruzeiro Vôlei x Norde Vôlei
    ["M", "R", 3, "2027-01-13", "18h30", 10, 8, ""], // Saneago Goiás Vôlei x Praia Clube Uberlandia Vôlei
    ["M", "R", 3, "2027-01-13", "21h00", 5, 4, ""], // Azulim/Sicoob/Monte x Itambé Minas
    // ---- MASCULINO · Returno · Rodada 4 ----
    ["M", "R", 4, "2027-01-16", "11h00", 12, 7, ""], // Viapol Vôlei São José x Norde Vôlei
    ["M", "R", 4, "2027-01-16", "16h00", 1, 6, ""], // Sesi Bauru x Montes Claros Vôlei
    ["M", "R", 4, "2027-01-17", "11h00", 8, 5, ""], // Praia Clube Uberlandia Vôlei x Azulim/Sicoob/Monte
    ["M", "R", 4, "2027-01-17", "18h30", 2, 10, ""], // Vôlei Renata x Saneago Goiás Vôlei
    ["M", "R", 4, "2027-01-18", "18h30", 4, 3, ""], // Itambé Minas x Sil Vôlei Guarulhos
    ["M", "R", 4, "2027-01-18", "21h00", 11, 9, ""], // Suzano Vôlei x Sada Cruzeiro Vôlei
    // ---- MASCULINO · Returno · Rodada 5 ----
    ["M", "R", 5, "2027-01-22", "18h30", 5, 2, ""], // Azulim/Sicoob/Monte x Vôlei Renata
    ["M", "R", 5, "2027-01-22", "21h00", 3, 8, ""], // Sil Vôlei Guarulhos x Praia Clube Uberlandia Vôlei
    ["M", "R", 5, "2027-01-23", "18h30", 4, 11, ""], // Itambé Minas x Suzano Vôlei
    ["M", "R", 5, "2027-01-23", "21h00", 9, 12, ""], // Sada Cruzeiro Vôlei x Viapol Vôlei São José
    ["M", "R", 5, "2027-01-24", "18h30", 6, 10, ""], // Montes Claros Vôlei x Saneago Goiás Vôlei
    ["M", "R", 5, "2027-01-24", "21h00", 7, 1, ""], // Norde Vôlei x Sesi Bauru
    // ---- MASCULINO · Returno · Rodada 6 ----
    ["M", "R", 6, "2027-01-29", "18h30", 2, 3, ""], // Vôlei Renata x Sil Vôlei Guarulhos
    ["M", "R", 6, "2027-01-29", "21h00", 9, 4, ""], // Sada Cruzeiro Vôlei x Itambé Minas
    ["M", "R", 6, "2027-01-30", "16h00", 10, 7, ""], // Saneago Goiás Vôlei x Norde Vôlei
    ["M", "R", 6, "2027-01-30", "18h30", 12, 1, ""], // Viapol Vôlei São José x Sesi Bauru
    ["M", "R", 6, "2027-01-30", "21h00", 8, 11, ""], // Praia Clube Uberlandia Vôlei x Suzano Vôlei
    ["M", "R", 6, "2027-01-31", "11h00", 5, 6, ""], // Azulim/Sicoob/Monte x Montes Claros Vôlei
    // ---- MASCULINO · Returno · Rodada 7 ----
    ["M", "R", 7, "2027-02-02", "18h30", 4, 8, ""], // Itambé Minas x Praia Clube Uberlandia Vôlei
    ["M", "R", 7, "2027-02-02", "18h30", 11, 2, ""], // Suzano Vôlei x Vôlei Renata
    ["M", "R", 7, "2027-02-02", "21h00", 1, 9, ""], // Sesi Bauru x Sada Cruzeiro Vôlei
    ["M", "R", 7, "2027-02-02", "21h00", 12, 10, ""], // Viapol Vôlei São José x Saneago Goiás Vôlei
    ["M", "R", 7, "2027-02-03", "18h30", 3, 6, ""], // Sil Vôlei Guarulhos x Montes Claros Vôlei
    ["M", "R", 7, "2027-02-03", "21h00", 7, 5, ""], // Norde Vôlei x Azulim/Sicoob/Monte
    // ---- MASCULINO · Returno · Rodada 8 ----
    ["M", "R", 8, "2027-02-07", "11h00", 5, 12, ""], // Azulim/Sicoob/Monte x Viapol Vôlei São José
    ["M", "R", 8, "2027-02-07", "16h00", 10, 1, ""], // Saneago Goiás Vôlei x Sesi Bauru
    ["M", "R", 8, "2027-02-08", "18h30", 2, 4, ""], // Vôlei Renata x Itambé Minas
    ["M", "R", 8, "2027-02-08", "18h30", 3, 7, ""], // Sil Vôlei Guarulhos x Norde Vôlei
    ["M", "R", 8, "2027-02-08", "21h00", 8, 9, ""], // Praia Clube Uberlandia Vôlei x Sada Cruzeiro Vôlei
    ["M", "R", 8, "2027-02-08", "21h00", 6, 11, ""], // Montes Claros Vôlei x Suzano Vôlei
    // ---- MASCULINO · Returno · Rodada 9 ----
    ["M", "R", 9, "2027-02-11", "18h30", 1, 5, ""], // Sesi Bauru x Azulim/Sicoob/Monte
    ["M", "R", 9, "2027-02-12", "18h30", 4, 6, ""], // Itambé Minas x Montes Claros Vôlei
    ["M", "R", 9, "2027-02-12", "18h30", 7, 11, ""], // Norde Vôlei x Suzano Vôlei
    ["M", "R", 9, "2027-02-12", "21h00", 10, 9, ""], // Saneago Goiás Vôlei x Sada Cruzeiro Vôlei
    ["M", "R", 9, "2027-02-12", "21h00", 8, 2, ""], // Praia Clube Uberlandia Vôlei x Vôlei Renata
    ["M", "R", 9, "2027-02-13", "16h00", 12, 3, ""], // Viapol Vôlei São José x Sil Vôlei Guarulhos
    // ---- MASCULINO · Returno · Rodada 10 ----
    ["M", "R", 10, "2027-02-16", "18h30", 2, 6, ""], // Vôlei Renata x Montes Claros Vôlei
    ["M", "R", 10, "2027-02-16", "21h00", 11, 1, ""], // Suzano Vôlei x Sesi Bauru
    ["M", "R", 10, "2027-02-17", "18h30", 12, 4, ""], // Viapol Vôlei São José x Itambé Minas
    ["M", "R", 10, "2027-02-17", "21h00", 5, 9, ""], // Azulim/Sicoob/Monte x Sada Cruzeiro Vôlei
    ["M", "R", 10, "2027-02-18", "18h30", 8, 7, ""], // Praia Clube Uberlandia Vôlei x Norde Vôlei
    ["M", "R", 10, "2027-02-18", "21h00", 3, 10, ""], // Sil Vôlei Guarulhos x Saneago Goiás Vôlei
    // ---- MASCULINO · Returno · Rodada 11 ----
    ["M", "R", 11, "2027-02-22", "18h30", 6, 8, ""], // Montes Claros Vôlei x Praia Clube Uberlandia Vôlei
    ["M", "R", 11, "2027-02-22", "18h30", 1, 3, ""], // Sesi Bauru x Sil Vôlei Guarulhos
    ["M", "R", 11, "2027-02-22", "21h00", 9, 2, ""], // Sada Cruzeiro Vôlei x Vôlei Renata
    ["M", "R", 11, "2027-02-23", "18h30", 10, 5, ""], // Saneago Goiás Vôlei x Azulim/Sicoob/Monte
    ["M", "R", 11, "2027-02-23", "18h30", 4, 7, ""], // Itambé Minas x Norde Vôlei
    ["M", "R", 11, "2027-02-23", "21h00", 11, 12, ""], // Suzano Vôlei x Viapol Vôlei São José
];

const listaJogosPadrao = calendario.map(([categoria, fase, rodada, data, hora, idMandante, idVisitante, local = "", aDefinir = false]) => ({
    // id fixo por confronto: não muda se a ordem, a data ou o horário do jogo mudar
    idJogo: (categoria === "F" ? 100000 : 200000) + (fase === "T" ? 0 : 10000) + idMandante * 100 + idVisitante,
    categoria, fase, rodada, data, hora, local, aDefinir, idMandante, idVisitante
}));