function assertRH_(matricula) {
  const colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  const colaborador = colaboradores.find((c) => String(c.Matricula) === String(matricula));
  const isRH = colaborador && (colaborador.RH === true || String(colaborador.RH).toUpperCase() === "TRUE");
  if (!isRH) throw new Error("Acesso restrito ao RH.");
  return colaborador;
}

function getAdminStats_(matricula) {
  assertRH_(matricula);

  const colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  const mensagens = sheetToObjects_(getSheet_(SHEETS.MENSAGENS));

  const totalColaboradores = colaboradores.length;
  const remetentesUnicos = new Set(mensagens.map((m) => String(m.RemetenteMatricula)));
  const totalParticipantes = remetentesUnicos.size;

  const totalMensagens = mensagens.length;
  const lidas = mensagens.filter(
    (m) => m.Visualizada === true || String(m.Visualizada).toUpperCase() === "TRUE",
  ).length;
  const naoLidas = totalMensagens - lidas;

  const setorPorMatricula = {};
  colaboradores.forEach((c) => (setorPorMatricula[String(c.Matricula)] = c.Setor));

  const porSetor = {};
  mensagens.forEach((m) => {
    const setor = setorPorMatricula[String(m.DestinatarioMatricula)] || "Sem setor";
    porSetor[setor] = (porSetor[setor] || 0) + 1;
  });

  const ranking = {};
  mensagens.forEach((m) => {
    const nome = m.RemetenteNome || m.RemetenteMatricula;
    ranking[nome] = (ranking[nome] || 0) + 1;
  });
  const rankingOrdenado = Object.entries(ranking)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const porDia = {};
  mensagens.forEach((m) => {
    const data = m.Data instanceof Date ? m.Data : new Date(m.Data);
    const chave = Utilities.formatDate(data, "GMT", "yyyy-MM-dd");
    porDia[chave] = (porDia[chave] || 0) + 1;
  });
  const porDiaOrdenado = Object.entries(porDia)
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => (a.data > b.data ? 1 : -1));

  return {
    totalColaboradores,
    totalParticipantes,
    totalMensagens,
    lidas,
    naoLidas,
    porSetor: Object.entries(porSetor).map(([setor, total]) => ({ setor, total })),
    ranking: rankingOrdenado,
    porDia: porDiaOrdenado,
  };
}

function getExportData_(matricula) {
  assertRH_(matricula);

  const colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  const setorPorMatricula = {};
  colaboradores.forEach((c) => (setorPorMatricula[String(c.Matricula)] = c.Setor));

  const mensagens = sheetToObjects_(getSheet_(SHEETS.MENSAGENS));

  return mensagens.map((m) => ({
    id: m.ID,
    data: m.Data instanceof Date ? m.Data.toISOString() : m.Data,
    remetente: m.RemetenteNome,
    setorRemetente: setorPorMatricula[String(m.RemetenteMatricula)] || "",
    destinatarioMatricula: String(m.DestinatarioMatricula),
    setorDestinatario: setorPorMatricula[String(m.DestinatarioMatricula)] || "",
    visualizada: m.Visualizada === true || String(m.Visualizada).toUpperCase() === "TRUE",
    dataVisualizacao: m.DataVisualizacao
      ? m.DataVisualizacao instanceof Date
        ? m.DataVisualizacao.toISOString()
        : m.DataVisualizacao
      : "",
  }));
}
