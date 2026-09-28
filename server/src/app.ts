import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { existsSync } from "node:fs";
import path from "node:path";
import type { EvolutionClient } from "./application/ports/evolution-client.js";
import type { AppConfig } from "./shared/config/env.js";
import { JSON_BODY_LIMIT } from "./shared/constants.js";
import { errorMiddleware } from "./presentation/http/middleware/error-middleware.js";
import { createOriginCheck } from "./presentation/http/middleware/origin-check.js";
import { createHttpRouter } from "./presentation/http/routes/index.js";

export interface AppDependencies {
  readonly config: AppConfig;
  readonly evolutionClient: EvolutionClient;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();
  app.set("trust proxy", deps.config.trustProxy);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: deps.config.clientOrigin,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(createOriginCheck(deps.config));
  app.use("/api/v1", createHttpRouter(deps));

  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "not_found", message: "Not found" },
    });
  });

  if (
    deps.config.clientDistPath !== null &&
    existsSync(deps.config.clientDistPath)
  ) {
    const clientDist = deps.config.clientDistPath;
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, "index.html"), (error: unknown) => {
        if (error) {
          next();
        }
      });
    });
  }

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "not_found", message: "Not found" },
    });
  });
  app.use(errorMiddleware);
  return app;
}
