export interface Mensagem {
  id: string;
  data: string; // ISO datetime
  remetenteMatricula: string;
  remetenteNome: string;
  remetenteFotoDriveId?: string | null;
  destinatarioMatricula: string;
  texto: string;
  imagemDriveId?: string | null;
  videoYoutubeId?: string | null;
  visualizada: boolean;
  dataVisualizacao?: string | null;
  favorita?: boolean;
  reacao?: TipoReacao | null;
}

export type TipoReacao = "coracao" | "sorriso" | "palmas" | "emocionado";

export interface NovaMensagemInput {
  destinatarioMatricula: string;
  texto: string;
  imagemDriveId?: string | null;
  videoYoutubeId?: string | null;
}
