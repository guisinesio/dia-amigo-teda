/**
 * Mantém o Apps Script "aquecido" para evitar cold start.
 *
 * CONFIGURAR UMA VEZ:
 * 1. No editor do Apps Script, clique no ícone de relógio (Acionadores / Triggers)
 * 2. Clique em "+ Adicionar acionador"
 * 3. Função: keepWarm
 * 4. Origem do evento: Baseado em tempo
 * 5. Tipo: Temporizador por minuto
 * 6. Intervalo: A cada 5 minutos
 * 7. Salvar
 */
function keepWarm() {
  SpreadsheetApp.openById(SPREADSHEET_ID).getName();
}
