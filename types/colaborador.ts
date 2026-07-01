export interface Colaborador {
  matricula: string;
  nome: string;
  nascimento: string; // ISO yyyy-mm-dd
  email: string;
  setor: string;
  fotoDriveId?: string | null;
  rh?: boolean;
}

export interface ColaboradorPublico {
  matricula: string;
  nome: string;
  setor: string;
  fotoDriveId?: string | null;
}
