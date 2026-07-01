const TIPOS_REACAO_VALIDOS = ["coracao", "sorriso", "palmas", "emocionado"];

function addReacao_(mensagemId, tipo, matricula) {
  if (!mensagemId || !tipo || !matricula) {
    throw new Error("Dados incompletos para reagir.");
  }
  if (TIPOS_REACAO_VALIDOS.indexOf(tipo) === -1) {
    throw new Error("Tipo de reação inválido.");
  }

  const mensagensSheet = getSheet_(SHEETS.MENSAGENS);
  const { row } = findMensagemRow_(mensagensSheet, mensagemId);

  if (String(row.DestinatarioMatricula) !== String(matricula)) {
    throw new Error("Apenas o destinatário pode reagir a esta mensagem.");
  }

  const reacoesSheet = getSheet_(SHEETS.REACOES);
  const values = reacoesSheet.getDataRange().getValues();
  const headers = values[0];
  const mensagemIdIndex = headers.indexOf("MensagemID");

  for (let i = 1; i < values.length; i++) {
    if (values[i][mensagemIdIndex] === mensagemId) {
      reacoesSheet.getRange(i + 1, headers.indexOf("Tipo") + 1).setValue(tipo);
      reacoesSheet.getRange(i + 1, headers.indexOf("Data") + 1).setValue(new Date());
      return { tipo };
    }
  }

  reacoesSheet.appendRow([generateId_(), mensagemId, tipo, new Date()]);
  logAction_("reacao.adicionada", matricula, mensagemId + ":" + tipo);

  return { tipo };
}
