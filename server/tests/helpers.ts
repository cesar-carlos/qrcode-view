import type { EvolutionClient } from "../src/application/ports/evolution-client.js";
import type { AppConfig } from "../src/shared/config/env.js";

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    port: 3000,
    nodeEnv: "test",
    evolutionApiBaseUrl: "https://evogo.example.test",
    clientOrigin: "http://localhost:5173",
    trustProxy: false,
    clientDistPath: null,
    ...overrides,
  };
}

export function fakeEvolutionClient(
  overrides: Partial<EvolutionClient> = {},
): EvolutionClient {
  return {
    getStatus: async () => ({
      connected: false,
      loggedIn: false,
      name: "Loja",
    }),
    connect: async () => undefined,
    getQr: async () => ({
      imageSrc: null,
      code: "qr-code",
      passkeyStage: null,
      passkeyOpenUrl: null,
      passkeyCode: null,
    }),
    pair: async () => ({ pairingCode: "ABCD-1234" }),
    reconnect: async () => undefined,
    disconnect: async () => undefined,
    ...overrides,
  };
}
