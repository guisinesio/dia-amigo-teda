function authLogin_(matricula, nascimento) {
  if (!matricula || !nascimento) {
    throw new Error("Informe matrícula e data de nascimento.");
  }

  const sheet = getSheet_(SHEETS.COLABORADORES);
  const rows = sheetToObjects_(sheet);

  const found = rows.find((row) => {
    const sameMatricula = String(row.Matricula).trim() === String(matricula).trim();
    const sameNascimento = formatDate_(row.Nascimento) === formatDate_(nascimento);
    return sameMatricula && sameNascimento;
  });

  if (!found) {
    throw new Error("Matrícula ou data de nascimento inválidas.");
  }

  logAction_("login", found.Matricula, "");

  return {
    matricula: String(found.Matricula),
    nome: found.Nome,
    nascimento: formatDate_(found.Nascimento),
    email: found.Email,
    setor: found.Setor,
    fotoDriveId: found.FotoDriveId || null,
    rh: found.RH === true || String(found.RH).toUpperCase() === "TRUE",
  };
}

function formatDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, "GMT", "yyyy-MM-dd");
  }
  // já vem como string "yyyy-MM-dd"
  return String(value).trim().slice(0, 10);
}
