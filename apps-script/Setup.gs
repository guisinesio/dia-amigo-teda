/**
 * Execute setupSpreadsheet() UMA VEZ pelo editor do Apps Script
 * para criar as planilhas (abas) e cabeçalhos, caso ainda não existam.
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  ensureSheet_(ss, SHEETS.COLABORADORES, [
    "Matricula",
    "Nome",
    "Nascimento",
    "Email",
    "Setor",
    "FotoDriveId",
    "RH",
  ]);

  ensureSheet_(ss, SHEETS.MENSAGENS, [
    "ID",
    "Data",
    "RemetenteMatricula",
    "RemetenteNome",
    "DestinatarioMatricula",
    "Texto",
    "ImagemDriveId",
    "VideoYoutubeId",
    "Visualizada",
    "DataVisualizacao",
    "Favorita",
  ]);

  ensureSheet_(ss, SHEETS.REACOES, ["ID", "MensagemID", "Tipo", "Data"]);

  ensureSheet_(ss, SHEETS.LOGS, ["Data", "Acao", "Usuario", "Detalhe"]);

  ensureSheet_(ss, SHEETS.CONFIGURACOES, ["Chave", "Valor"]);

  Logger.log("Planilhas verificadas/criadas com sucesso.");
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

/**
 * Execute UMA VEZ pelo editor para gravar o token de autenticação
 * que o Next.js usará em todas as chamadas (GAS_TOKEN no .env.local).
 * Troque "COLOQUE_UM_TOKEN_FORTE_AQUI" por um valor seguro antes de rodar.
 */
function setupToken() {
  const token = "COLOQUE_UM_TOKEN_FORTE_AQUI";
  PropertiesService.getScriptProperties().setProperty("TOKEN", token);
  Logger.log("Token configurado. Copie o mesmo valor para GAS_TOKEN no .env.local");
}
