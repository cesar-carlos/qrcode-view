import type { Request, Response } from "express";
import { disconnectInstance } from "../../../application/instance/disconnect-instance.js";
import { getInstanceStatus } from "../../../application/instance/get-instance-status.js";
import { getQrCode } from "../../../application/instance/get-qr-code.js";
import { reconnectInstance } from "../../../application/instance/reconnect-instance.js";
import { requestPairingCode } from "../../../application/instance/request-pairing-code.js";
import { startConnection } from "../../../application/instance/start-connection.js";
import type { EvolutionClient } from "../../../application/ports/evolution-client.js";
import { asyncHandler, failureToError } from "../http.js";
import { getInstanceToken } from "../middleware/require-instance-session.js";
import { getValidatedBody } from "../middleware/validate-request.js";
import type {
  ConnectBody,
  PairBody,
} from "../validators/instance.validator.js";

export function createInstanceController(deps: {
  evolutionClient: EvolutionClient;
}) {
  const client = deps.evolutionClient;

  return {
    status: asyncHandler(
      async (_req: Request, res: Response): Promise<void> => {
        const result = await getInstanceStatus(client, getInstanceToken(res));
        if (!result.success) {
          throw failureToError(result.error);
        }
        res.status(200).json({ success: true, data: result.data });
      },
    ),
    connect: asyncHandler(
      async (_req: Request, res: Response): Promise<void> => {
        const body = getValidatedBody<ConnectBody>(res);
        const result = await startConnection(
          client,
          getInstanceToken(res),
          body,
        );
        if (!result.success) {
          throw failureToError(result.error);
        }
        res.status(200).json({ success: true, data: result.data });
      },
    ),
    qr: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      const result = await getQrCode(client, getInstanceToken(res));
      if (!result.success) {
        throw failureToError(result.error);
      }
      res.status(200).json({ success: true, data: result.data });
    }),
    pair: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      const body = getValidatedBody<PairBody>(res);
      const result = await requestPairingCode(
        client,
        getInstanceToken(res),
        body,
      );
      if (!result.success) {
        throw failureToError(result.error);
      }
      res.status(200).json({ success: true, data: result.data });
    }),
    reconnect: asyncHandler(
      async (_req: Request, res: Response): Promise<void> => {
        const result = await reconnectInstance(client, getInstanceToken(res));
        if (!result.success) {
          throw failureToError(result.error);
        }
        res.status(200).json({ success: true, data: result.data });
      },
    ),
    disconnect: asyncHandler(
      async (_req: Request, res: Response): Promise<void> => {
        const result = await disconnectInstance(client, getInstanceToken(res));
        if (!result.success) {
          throw failureToError(result.error);
        }
        res.status(200).json({ success: true, data: result.data });
      },
    ),
  };
}
