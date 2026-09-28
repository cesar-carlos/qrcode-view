import { UPSTREAM_TIMEOUT_MS } from "../../shared/constants.js";
import type { AppConfig } from "../../shared/config/env.js";
import { EvolutionRequestError } from "../../application/evolution-request-error.js";
import type {
  ConnectInput,
  EvolutionClient,
  InstanceStatus,
  PairingResult,
  PairInput,
  QrCode,
} from "../../application/ports/evolution-client.js";
import {
  parseInstanceStatus,
  parsePairingCode,
  parseQrCode,
} from "./evolution-response.js";

/** Instance-token routes only. Do not add create, delete, logout, proxy, or logs. */
const routes = {
  status: { method: "GET", path: "/instance/status" },
  connect: { method: "POST", path: "/instance/connect" },
  qr: { method: "GET", path: "/instance/qr" },
  pair: { method: "POST", path: "/instance/pair" },
  reconnect: { method: "POST", path: "/instance/reconnect" },
  disconnect: { method: "POST", path: "/instance/disconnect" },
} as const;

type Route = (typeof routes)[keyof typeof routes];

export function createEvolutionClient(
  config: Pick<AppConfig, "evolutionApiBaseUrl">,
): EvolutionClient {
  return {
    getStatus(token: string): Promise<InstanceStatus> {
      return send(config.evolutionApiBaseUrl, token, routes.status).then(
        parseInstanceStatus,
      );
    },
    connect(token: string, input: ConnectInput): Promise<void> {
      return send(config.evolutionApiBaseUrl, token, routes.connect, {
        immediate: true,
        webhookUrl: input.webhookUrl ?? "",
        subscribe: input.subscribe ?? [],
        phone: input.phone ?? "",
        rabbitmqEnable: "",
        websocketEnable: "",
        natsEnable: "",
      }).then(() => undefined);
    },
    getQr(token: string): Promise<QrCode> {
      return send(config.evolutionApiBaseUrl, token, routes.qr).then(
        parseQrCode,
      );
    },
    pair(token: string, input: PairInput): Promise<PairingResult> {
      return send(config.evolutionApiBaseUrl, token, routes.pair, {
        phone: input.phone,
        subscribe: ["CONNECTION", "QRCODE"],
      }).then(parsePairingCode);
    },
    reconnect(token: string): Promise<void> {
      return send(config.evolutionApiBaseUrl, token, routes.reconnect).then(
        () => undefined,
      );
    },
    disconnect(token: string): Promise<void> {
      return send(config.evolutionApiBaseUrl, token, routes.disconnect).then(
        () => undefined,
      );
    },
  };
}

async function send(
  baseUrl: string,
  token: string,
  route: Route,
  body?: unknown,
): Promise<unknown> {
  const url = new URL(route.path, baseUrl);
  const headers = new Headers({
    accept: "application/json",
    apikey: token,
  });
  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: route.method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    throw new EvolutionRequestError(
      "unavailable",
      "Evolution GO is unavailable",
    );
  }

  if (response.status >= 300 && response.status < 400) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
  if (response.status === 401) {
    throw new EvolutionRequestError(
      "unauthorized",
      "Instance token was rejected",
    );
  }
  if (response.status === 400) {
    throw new EvolutionRequestError(
      "not_ready",
      "The instance is not ready for that action yet",
    );
  }
  if (!response.ok) {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }

  const text = await response.text();
  if (text.length === 0) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new EvolutionRequestError("upstream", "Upstream request failed");
  }
}
