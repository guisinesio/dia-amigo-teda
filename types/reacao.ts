import type { TipoReacao } from "./mensagem";

export interface Reacao {
  id: string;
  mensagemId: string;
  tipo: TipoReacao;
  data: string;
}

export const REACOES: { tipo: TipoReacao; emoji: string; label: string }[] = [
  { tipo: "coracao", emoji: "❤️", label: "Amei" },
  { tipo: "sorriso", emoji: "😊", label: "Feliz" },
  { tipo: "palmas", emoji: "👏", label: "Parabéns" },
  { tipo: "emocionado", emoji: "🥹", label: "Emocionado" },
];
