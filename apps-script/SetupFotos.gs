var FOTOS_FOLDER_ID = "14tvUonnjVwN8PaVVh2ZUjhlEpjoIjkBu";

/**
 * Execute UMA VEZ pelo editor do Apps Script.
 * Lista todos os arquivos da pasta de fotos e exibe no log.
 * Use para conferir os nomes dos arquivos antes de associar.
 */
function listarFotos() {
  var folder = DriveApp.getFolderById(FOTOS_FOLDER_ID);
  var files = folder.getFiles();
  var result = [];
  while (files.hasNext()) {
    var f = files.next();
    result.push({ nome: f.getName(), id: f.getId() });
  }
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Execute UMA VEZ para tornar todas as fotos da pasta acessíveis publicamente.
 * Necessário para que as fotos apareçam no app.
 */
function publicarFotos() {
  var folder = DriveApp.getFolderById(FOTOS_FOLDER_ID);
  var files = folder.getFiles();
  var count = 0;
  while (files.hasNext()) {
    var f = files.next();
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    count++;
  }
  Logger.log("Fotos publicadas: " + count);
}

/**
 * Execute após publicarFotos().
 * Tenta associar automaticamente os arquivos de foto com os colaboradores.
 *
 * ESTRATÉGIA DE MATCH (em ordem de prioridade):
 * 1. Nome do arquivo = matrícula do colaborador (ex: "12345.jpg")
 * 2. Nome do arquivo contém o nome do colaborador (ex: "Guilherme Ferreira.jpg")
 *
 * Colaboradores sem match ficam com FotoDriveId vazio — associe manualmente.
 */
function associarFotos() {
  var folder = DriveApp.getFolderById(FOTOS_FOLDER_ID);
  var files = folder.getFiles();

  // Monta mapa de fotos
  var fotos = [];
  while (files.hasNext()) {
    var f = files.next();
    fotos.push({ nome: f.getName().toLowerCase(), id: f.getId() });
  }

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COLABORADORES);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var matriculaCol = headers.indexOf("Matricula");
  var nomeCol = headers.indexOf("Nome");
  var fotoCol = headers.indexOf("FotoDriveId");

  if (fotoCol === -1) {
    Logger.log("Coluna FotoDriveId não encontrada na planilha Colaboradores.");
    return;
  }

  var atualizados = 0;
  var semMatch = [];

  for (var i = 1; i < values.length; i++) {
    var matricula = String(values[i][matriculaCol]).toLowerCase().trim();
    var nome = String(values[i][nomeCol]).toLowerCase().trim();

    // Já tem foto? Pula.
    if (values[i][fotoCol]) continue;

    var match = null;

    // 1) Tenta match por matrícula (nome do arquivo = matrícula)
    match = fotos.find(function(foto) {
      var sem_ext = foto.nome.replace(/\.[^.]+$/, "").trim();
      return sem_ext === matricula;
    });

    // 2) Tenta match por nome (arquivo contém nome do colaborador)
    if (!match) {
      match = fotos.find(function(foto) {
        return foto.nome.indexOf(nome) !== -1 || nome.indexOf(foto.nome.replace(/\.[^.]+$/, "").trim()) !== -1;
      });
    }

    if (match) {
      sheet.getRange(i + 1, fotoCol + 1).setValue(match.id);
      atualizados++;
    } else {
      semMatch.push(values[i][nomeCol]);
    }
  }

  Logger.log("✅ Associados: " + atualizados);
  if (semMatch.length > 0) {
    Logger.log("⚠️ Sem match (associe manualmente): " + semMatch.join(", "));
  }
}
