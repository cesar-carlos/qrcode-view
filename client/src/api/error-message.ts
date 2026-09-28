import { ApiError } from "./http";

export type UserAction =
  | "session"
  | "restore"
  | "status"
  | "connect"
  | "qr"
  | "pair"
  | "reconnect"
  | "disconnect";

const actionLead: Record<UserAction, string> = {
  session: "Não foi possível validar o token",
  restore: "Não foi possível verificar a sessão",
  status: "Não foi possível consultar esta instância",
  connect: "Não foi possível iniciar a conexão",
  qr: "Não foi possível atualizar o QR Code",
  pair: "Não foi possível gerar o código de pareamento",
  reconnect: "Não foi possível reconectar",
  disconnect: "Não foi possível desconectar o WhatsApp",
};

const detailByCode: Record<string, string> = {
  validation_error: "Verifique os dados e tente de novo.",
  not_ready:
    "A instância ainda não está pronta. Espere um instante e tente de novo.",
  upstream_error: "O Evolution GO não concluiu o pedido.",
  upstream_unavailable:
    "O Evolution GO está indisponível. Tente de novo em instantes.",
  rate_limited: "Muitas tentativas. Espere um momento e tente de novo.",
  not_found: "Não encontramos o que foi pedido.",
  internal_error: "Ocorreu um erro interno. Tente de novo.",
  invalid_response: "A resposta do servidor veio incompleta.",
  request_failed: "A resposta do servidor não pôde ser lida.",
  network: "Sem conexão com o servidor. Verifique a rede e tente de novo.",
};

export const SESSION_EXPIRED_MESSAGE =
  "Sessão expirada. Informe o token de novo.";

export const TOKEN_REJECTED_MESSAGE =
  "Token não encontrado. Confira o token da instância no Evolution GO.";

export function messageForApiError(error: unknown, action: UserAction): string {
  if (error instanceof ApiError && error.code === "unauthorized") {
    if (error.message === "Not authorized") {
      return SESSION_EXPIRED_MESSAGE;
    }
    return TOKEN_REJECTED_MESSAGE;
  }

  const detail =
    error instanceof ApiError
      ? (detailByCode[error.code] ?? "Tente de novo.")
      : detailByCode.network;
  return `${actionLead[action]}. ${detail}`;
}
