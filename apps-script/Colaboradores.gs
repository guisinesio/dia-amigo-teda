function updateFotoColaborador_(matricula, fotoUrl) {
  if (!matricula || !fotoUrl) throw new Error("Matrícula e URL são obrigatórios.");

  var sheet = getSheet_(SHEETS.COLABORADORES);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var matriculaCol = headers.indexOf("Matricula");
  var fotoCol = headers.indexOf("FotoDriveId");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][matriculaCol]).trim() === String(matricula).trim()) {
      sheet.getRange(i + 1, fotoCol + 1).setValue(fotoUrl);
      logAction_("foto.atualizada", matricula, fotoUrl);
      return { ok: true };
    }
  }
  throw new Error("Colaborador não encontrado.");
}

function searchColaboradores_(query) {
  if (!query || query.trim().length < 2) return [];

  const sheet = getSheet_(SHEETS.COLABORADORES);
  const rows = sheetToObjects_(sheet);
  const q = query.trim().toLowerCase();

  return rows
    .filter((row) => String(row.Nome).toLowerCase().includes(q))
    .slice(0, 8)
    .map((row) => ({
      matricula: String(row.Matricula),
      nome: row.Nome,
      setor: row.Setor,
      fotoDriveId: row.FotoDriveId || null,
    }));
}

function getColaboradorPerfil_(matricula) {
  const colaboradoresSheet = getSheet_(SHEETS.COLABORADORES);
  const colaboradores = sheetToObjects_(colaboradoresSheet);
  const colaborador = colaboradores.find((row) => String(row.Matricula).trim() === String(matricula).trim());

  if (!colaborador) throw new Error("Colaborador não encontrado.");

  const mensagensSheet = getSheet_(SHEETS.MENSAGENS);
  const mensagens = sheetToObjects_(mensagensSheet);

  const enviadas = mensagens.filter((m) => String(m.RemetenteMatricula) === String(matricula));
  const recebidas = mensagens.filter((m) => String(m.DestinatarioMatricula) === String(matricula));

  const reacoesSheet = getSheet_(SHEETS.REACOES);
  const reacoes = sheetToObjects_(reacoesSheet);
  const idsRecebidas = new Set(recebidas.map((m) => m.ID));
  const reacoesRecebidas = reacoes.filter((r) => idsRecebidas.has(r.MensagemID));

  return {
    matricula: String(colaborador.Matricula),
    nome: colaborador.Nome,
    setor: colaborador.Setor,
    fotoDriveId: colaborador.FotoDriveId || null,
    totalEnviadas: enviadas.length,
    totalRecebidas: recebidas.length,
    totalReacoesRecebidas: reacoesRecebidas.length,
  };
}
