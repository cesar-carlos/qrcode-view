import { z } from "zod";

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: "development" | "test" | "production";
  readonly evolutionApiBaseUrl: string;
  readonly clientOrigin: string;
  readonly trustProxy: boolean;
  readonly clientDistPath: string | null;
}

const envSchema = z.object({
  PORT: z.preprocess(
    (value) => (value === undefined || value === "" ? 3000 : value),
    z.coerce.number().int().positive(),
  ),
  NODE_ENV: z.preprocess(
    (value) => (value === undefined || value === "" ? "development" : value),
    z.enum(["development", "test", "production"]),
  ),
  EVOLUTION_API_BASE_URL: z.preprocess(
    (value) =>
      value === undefined || value === ""
        ? "https://evogo.se7esistemassinop.com.br"
        : value,
    z.url(),
  ),
  CLIENT_ORIGIN: z.preprocess(
    (value) =>
      value === undefined || value === "" ? "http://localhost:5173" : value,
    z.url(),
  ),
  TRUST_PROXY: z.preprocess(
    (value) => (value === undefined || value === "" ? "false" : value),
    z.enum(["true", "false"]),
  ),
});

export function loadConfig(
  env: NodeJS.ProcessEnv,
  clientDistPath: string | null,
): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error("Invalid environment configuration");
  }

  return {
    port: parsed.data.PORT,
    nodeEnv: parsed.data.NODE_ENV,
    evolutionApiBaseUrl: parsed.data.EVOLUTION_API_BASE_URL,
    clientOrigin: parsed.data.CLIENT_ORIGIN,
    trustProxy: parsed.data.TRUST_PROXY === "true",
    clientDistPath,
  };
}
