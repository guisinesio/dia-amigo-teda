function assertRH_(matricula) {
  const colaboradores = sheetToObjects_(
    getSheet_(SHEETS.COLABORADORES),
  );

  const colaborador = colaboradores.find(
    (c) =>
      String(c.Matricula || "").trim() ===
      String(matricula || "").trim(),
  );

  const isRH =
    colaborador &&
    (colaborador.RH === true ||
      String(colaborador.RH).toUpperCase() === "TRUE");

  if (!isRH) {
    throw new Error("Acesso restrito ao RH.");
  }

  return colaborador;
}

function listColaboradoresAdmin_(matricula) {
  assertRH_(matricula);

  const colaboradores = sheetToObjects_(
    getSheet_(SHEETS.COLABORADORES),
  );

  return colaboradores
    .filter((c) => String(c.Matricula || "").trim())
    .map((c) => ({
      matricula: String(c.Matricula || "").trim(),
      nome: String(c.Nome || "").trim(),
      setor: String(c.Setor || "").trim(),
      fotoDriveId: c.FotoDriveId
        ? String(c.FotoDriveId).trim()
        : null,
    }))
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
}

function getAdminStats_(matricula) {
  assertRH_(matricula);

  const colaboradores = sheetToObjects_(
    getSheet_(SHEETS.COLABORADORES),
  );

  const mensagens = sheetToObjects_(
    getSheet_(SHEETS.MENSAGENS),
  );

  const totalColaboradores = colaboradores.length;

  const remetentesUnicos = new Set(
    mensagens
      .map((m) =>
        String(m.RemetenteMatricula || "").trim(),
      )
      .filter(Boolean),
  );

  const totalParticipantes = remetentesUnicos.size;
  const totalMensagens = mensagens.length;

  const lidas = mensagens.filter(
    (m) =>
      m.Visualizada === true ||
      String(m.Visualizada).toUpperCase() === "TRUE",
  ).length;

  const naoLidas = totalMensagens - lidas;

  const setorPorMatricula = {};
  const nomePorMatricula = {};

  colaboradores.forEach((c) => {
    const matriculaColaborador = String(
      c.Matricula || "",
    ).trim();

    if (!matriculaColaborador) return;

    setorPorMatricula[matriculaColaborador] =
      c.Setor || "Sem setor";

    nomePorMatricula[matriculaColaborador] =
      c.Nome || matriculaColaborador;
  });

  const porSetor = {};

  mensagens.forEach((m) => {
    const matriculaDestinatario = String(
      m.DestinatarioMatricula || "",
    ).trim();

    const setor =
      setorPorMatricula[matriculaDestinatario] ||
      "Sem setor";

    porSetor[setor] = (porSetor[setor] || 0) + 1;
  });

  // Ranking de quem mais enviou mensagens
  const ranking = {};

  mensagens.forEach((m) => {
    const nome = String(
      m.RemetenteNome ||
        m.RemetenteMatricula ||
        "",
    ).trim();

    if (!nome) return;

    ranking[nome] = (ranking[nome] || 0) + 1;
  });

  const rankingOrdenado = Object.entries(ranking)
    .map(([nome, total]) => ({
      nome,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Ranking de quem mais recebeu mensagens
  const rankingRecebidos = {};

  mensagens.forEach((m) => {
    const matriculaDestinatario = String(
      m.DestinatarioMatricula || "",
    ).trim();

    if (!matriculaDestinatario) return;

    rankingRecebidos[matriculaDestinatario] =
      (rankingRecebidos[matriculaDestinatario] || 0) + 1;
  });

  const rankingRecebidosOrdenado = Object.entries(
    rankingRecebidos,
  )
    .map(([matricula, total]) => ({
      matricula,
      nome: nomePorMatricula[matricula] || matricula,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const porDia = {};

  mensagens.forEach((m) => {
    const data =
      m.Data instanceof Date
        ? m.Data
        : new Date(m.Data);

    if (isNaN(data.getTime())) return;

    const chave = Utilities.formatDate(
      data,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );

    porDia[chave] = (porDia[chave] || 0) + 1;
  });

  const porDiaOrdenado = Object.entries(porDia)
    .map(([data, total]) => ({
      data,
      total,
    }))
    .sort((a, b) => (a.data > b.data ? 1 : -1));

  return {
    totalColaboradores,
    totalParticipantes,
    totalMensagens,
    lidas,
    naoLidas,

    porSetor: Object.entries(porSetor).map(
      ([setor, total]) => ({
        setor,
        total,
      }),
    ),

    ranking: rankingOrdenado,
    rankingRecebidos: rankingRecebidosOrdenado,
    porDia: porDiaOrdenado,
  };
}

function getExportData_(matricula) {
  assertRH_(matricula);

  const colaboradores = sheetToObjects_(
    getSheet_(SHEETS.COLABORADORES),
  );

  const setorPorMatricula = {};

  colaboradores.forEach((c) => {
    const matriculaColaborador = String(
      c.Matricula || "",
    ).trim();

    if (!matriculaColaborador) return;

    setorPorMatricula[matriculaColaborador] =
      c.Setor || "";
  });

  const mensagens = sheetToObjects_(
    getSheet_(SHEETS.MENSAGENS),
  );

  return mensagens.map((m) => ({
    id: m.ID,

    data:
      m.Data instanceof Date
        ? m.Data.toISOString()
        : m.Data,

    remetente:
      m.RemetenteNome ||
      m.RemetenteMatricula ||
      "",

    setorRemetente:
      setorPorMatricula[
        String(m.RemetenteMatricula || "").trim()
      ] || "",

    destinatarioMatricula: String(
      m.DestinatarioMatricula || "",
    ).trim(),

    setorDestinatario:
      setorPorMatricula[
        String(m.DestinatarioMatricula || "").trim()
      ] || "",

    visualizada:
      m.Visualizada === true ||
      String(m.Visualizada).toUpperCase() === "TRUE",

    dataVisualizacao: m.DataVisualizacao
      ? m.DataVisualizacao instanceof Date
        ? m.DataVisualizacao.toISOString()
        : m.DataVisualizacao
      : "",
  }));
}