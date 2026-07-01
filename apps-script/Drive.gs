function uploadImage_(base64, mimeType, filename) {
  if (!base64 || !mimeType) {
    throw new Error("Imagem inválida.");
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.indexOf(mimeType) === -1) {
    throw new Error("Formato de imagem não suportado.");
  }

  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, filename || "foto.jpg");

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return { fileId: file.getId() };
}
