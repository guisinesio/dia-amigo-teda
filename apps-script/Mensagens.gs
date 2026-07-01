function listMural_() {
  var sheet = getSheet_(SHEETS.MENSAGENS);
  var colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  var rows = sheetToObjects_(sheet);

  return rows
    .filter(function(r) { return r.ID; })
    .sort(function(a, b) { return new Date(b.Data) - new Date(a.Data); })
    .slice(0, 100)
    .map(function(r) {
      var dest = colaboradores.find(function(c) {
        return String(c.Matricula) === String(r.DestinatarioMatricula);
      });
      var rem = colaboradores.find(function(c) {
        return String(c.Matricula) === String(r.RemetenteMatricula);
      });
      return {
        id: r.ID,
        texto: String(r.Texto || ""),
        remetenteNome: r.RemetenteNome || "Anônimo",
        remetenteFotoId: rem ? (rem.FotoDriveId || null) : null,
        destinatarioNome: dest ? dest.Nome : "—",
        destinatarioFotoId: dest ? (dest.FotoDriveId || null) : null,
        data: r.Data instanceof Date ? r.Data.toISOString() : String(r.Data),
        imagemDriveId: r.ImagemDriveId || null,
        videoYoutubeId: r.VideoYoutubeId || null,
      };
    });
}

function listInbox_(matricula) {
  if (!matricula) throw new Error("Matrícula obrigatória.");

  const mensagens = sheetToObjects_(getSheet_(SHEETS.MENSAGENS));
  const reacoesPorMensagem = mapReacoesPorMensagem_();

  return mensagens
    .filter((m) => String(m.DestinatarioMatricula) === String(matricula))
    .sort((a, b) => new Date(b.Data) - new Date(a.Data))
    .map((m) => mensagemRowToObject_(m, reacoesPorMensagem));
}

function listSent_(matricula) {
  if (!matricula) throw new Error("Matrícula obrigatória.");

  const mensagens = sheetToObjects_(getSheet_(SHEETS.MENSAGENS));
  const colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  const reacoesPorMensagem = mapReacoesPorMensagem_();

  return mensagens
    .filter((m) => String(m.RemetenteMatricula) === String(matricula))
    .sort((a, b) => new Date(b.Data) - new Date(a.Data))
    .map((m) => {
      const destinatario = colaboradores.find(
        (c) => String(c.Matricula) === String(m.DestinatarioMatricula),
      );
      return Object.assign(mensagemRowToObject_(m, reacoesPorMensagem), {
        destinatarioNome: destinatario ? destinatario.Nome : "—",
      });
    });
}

function getMensagem_(id, matricula) {
  const mensagens = sheetToObjects_(getSheet_(SHEETS.MENSAGENS));
  const row = mensagens.find((m) => m.ID === id);
  if (!row) throw new Error("Mensagem não encontrada.");

  const isParticipante =
    String(row.RemetenteMatricula) === String(matricula) ||
    String(row.DestinatarioMatricula) === String(matricula);
  if (!isParticipante) throw new Error("Acesso não permitido a esta mensagem.");

  const reacoesPorMensagem = mapReacoesPorMensagem_();
  return mensagemRowToObject_(row, reacoesPorMensagem);
}

function createMensagem_(body) {
  const { remetenteMatricula, destinatarioMatricula, texto, imagemDriveId, videoYoutubeId } = body;

  if (!remetenteMatricula || !destinatarioMatricula || !texto) {
    throw new Error("Preencha destinatário e mensagem.");
  }
  if (String(remetenteMatricula) === String(destinatarioMatricula)) {
    throw new Error("Não é possível enviar uma mensagem para si mesmo.");
  }

  const colaboradores = sheetToObjects_(getSheet_(SHEETS.COLABORADORES));
  const remetente = colaboradores.find((c) => String(c.Matricula) === String(remetenteMatricula));
  if (!remetente) throw new Error("Remetente inválido.");

  const id = generateId_();
  const sheet = getSheet_(SHEETS.MENSAGENS);
  sheet.appendRow([
    id,
    new Date(),
    String(remetenteMatricula),
    remetente.Nome,
    String(destinatarioMatricula),
    texto,
    imagemDriveId || "",
    videoYoutubeId || "",
    false,
    "",
    false,
  ]);

  logAction_("mensagem.criada", remetenteMatricula, id);

  return { id };
}

function markAsRead_(id, matricula) {
  const sheet = getSheet_(SHEETS.MENSAGENS);
  const { row, rowIndex, headers } = findMensagemRow_(sheet, id);

  if (String(row.DestinatarioMatricula) !== String(matricula)) {
    throw new Error("Apenas o destinatário pode marcar como lida.");
  }

  const primeiraLeitura = row.Visualizada !== true && String(row.Visualizada).toUpperCase() !== "TRUE";

  if (primeiraLeitura) {
    sheet.getRange(rowIndex, headers.indexOf("Visualizada") + 1).setValue(true);
    sheet.getRange(rowIndex, headers.indexOf("DataVisualizacao") + 1).setValue(new Date());
    logAction_("mensagem.lida", matricula, id);
  }

  return { primeiraLeitura };
}

function toggleFavorite_(id, matricula) {
  const sheet = getSheet_(SHEETS.MENSAGENS);
  const { row, rowIndex, headers } = findMensagemRow_(sheet, id);

  const isParticipante =
    String(row.RemetenteMatricula) === String(matricula) ||
    String(row.DestinatarioMatricula) === String(matricula);
  if (!isParticipante) throw new Error("Acesso não permitido.");

  const atual = row.Favorita === true || String(row.Favorita).toUpperCase() === "TRUE";
  const novoValor = !atual;
  sheet.getRange(rowIndex, headers.indexOf("Favorita") + 1).setValue(novoValor);

  return { favorita: novoValor };
}

function findMensagemRow_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("ID");

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] === id) {
      const row = {};
      headers.forEach((h, j) => (row[h] = values[i][j]));
      return { row, rowIndex: i + 1, headers };
    }
  }
  throw new Error("Mensagem não encontrada.");
}

function mapReacoesPorMensagem_() {
  const reacoes = sheetToObjects_(getSheet_(SHEETS.REACOES));
  const map = {};
  reacoes.forEach((r) => {
    map[r.MensagemID] = r.Tipo;
  });
  return map;
}

function mensagemRowToObject_(row, reacoesPorMensagem) {
  return {
    id: row.ID,
    data: row.Data instanceof Date ? row.Data.toISOString() : row.Data,
    remetenteMatricula: String(row.RemetenteMatricula),
    remetenteNome: row.RemetenteNome,
    destinatarioMatricula: String(row.DestinatarioMatricula),
    texto: row.Texto,
    imagemDriveId: row.ImagemDriveId || null,
    videoYoutubeId: row.VideoYoutubeId || null,
    visualizada: row.Visualizada === true || String(row.Visualizada).toUpperCase() === "TRUE",
    dataVisualizacao: row.DataVisualizacao
      ? row.DataVisualizacao instanceof Date
        ? row.DataVisualizacao.toISOString()
        : row.DataVisualizacao
      : null,
    favorita: row.Favorita === true || String(row.Favorita).toUpperCase() === "TRUE",
    reacao: reacoesPorMensagem[row.ID] || null,
  };
}
