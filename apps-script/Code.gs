/**
 * Roteador principal do backend (Web App).
 * Todas as chamadas do Next.js chegam aqui via doPost, com { action, token, ...payload } no corpo JSON.
 */

const SPREADSHEET_ID = "17CWxnxlsUkRirghkriSM33U2hU3x1afo20RvtSsOUTw";
const DRIVE_FOLDER_ID = "1uHb-Rtj0PWYE5djuPjjUEft9Uw6l92co";

const SHEETS = {
  COLABORADORES: "Colaboradores",
  MENSAGENS: "Mensagens",
  REACOES: "Reacoes",
  LOGS: "Logs",
  CONFIGURACOES: "Configuracoes",
};

function doGet(e) {
  var payloadStr = e && e.parameter && e.parameter.payload;
  if (!payloadStr) return jsonOut({ ok: false, error: "Payload ausente." });

  var body;
  try {
    body = JSON.parse(payloadStr);
  } catch (err) {
    return jsonOut({ ok: false, error: "Payload inválido." });
  }

  if (!validateToken_(body.token)) {
    return jsonOut({ ok: false, error: "Não autorizado." });
  }

  try {
    var result = routeAction_(body.action, body);
    return jsonOut({ ok: true, data: result });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: "Corpo da requisição inválido." });
  }

  if (!validateToken_(body.token)) {
    return jsonOut({ ok: false, error: "Não autorizado." });
  }

  try {
    const result = routeAction_(body.action, body);
    return jsonOut({ ok: true, data: result });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message || String(err) });
  }
}

function routeAction_(action, body) {
  switch (action) {
    case "auth.login":
      return authLogin_(body.matricula, body.nascimento);

    case "colaboradores.search":
      return searchColaboradores_(body.query);

    case "colaboradores.get":
      return getColaboradorPerfil_(body.matricula);

    case "colaboradores.updateFoto":
      return updateFotoColaborador_(body.matricula, body.fotoUrl);

    case "mensagens.mural":
      return listMural_();

    case "mensagens.inbox":
      return listInbox_(body.matricula);

    case "mensagens.sent":
      return listSent_(body.matricula);

    case "mensagens.get":
      return getMensagem_(body.id, body.matricula);

    case "mensagens.create":
      return createMensagem_(body);

    case "mensagens.markRead":
      return markAsRead_(body.id, body.matricula);

    case "mensagens.toggleFavorite":
      return toggleFavorite_(body.id, body.matricula);

    case "reacoes.add":
      return addReacao_(body.mensagemId, body.tipo, body.matricula);

    case "drive.upload":
      return uploadImage_(body.base64, body.mimeType, body.filename);

    case "admin.stats":
      return getAdminStats_(body.matricula);

    case "admin.export":
      return getExportData_(body.matricula);

    case "ping":
      return "pong";

    default:
      throw new Error("Ação desconhecida: " + action);
  }
}

function validateToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("TOKEN");
  return expected && token === expected;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) throw new Error("Planilha não encontrada: " + name);
  return sheet;
}

function logAction_(acao, usuario, detalhe) {
  const sheet = getSheet_(SHEETS.LOGS);
  sheet.appendRow([new Date(), acao, usuario, detalhe || ""]);
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function generateId_() {
  return Utilities.getUuid();
}
