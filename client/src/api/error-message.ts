import { ApiError } from "./http";

const messagesByCode: Record<string, string> = {
  unauthorized: "Token não encontrado",
  validation_error: "Verifique os dados e tente de novo",
  not_ready: "A instância ainda não está pronta. Tente de novo em instantes.",
  upstream_error: "Não foi possível falar com o servidor",
  upstream_unavailable: "O serviço está indisponível",
  rate_limited: "Muitas tentativas. Espere um momento.",
  not_found: "Não encontrado",
  internal_error: "Erro interno. Tente de novo.",
  invalid_response: "Resposta inválida do servidor",
  request_failed: "Não foi possível concluir a ação",
};

export function messageForApiError(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.code === "unauthorized" && error.message === "Not authorized") {
    return "Sessão expirada. Informe o token de novo.";
  }
  return messagesByCode[error.code] ?? fallback;
}
