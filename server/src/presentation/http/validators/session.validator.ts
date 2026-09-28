import { z } from "zod";
import {
  INSTANCE_TOKEN_MAX_LENGTH,
  INSTANCE_TOKEN_MIN_LENGTH,
} from "../../../shared/constants.js";

export const openSessionBodySchema = z.object({
  token: z
    .string()
    .trim()
    .min(INSTANCE_TOKEN_MIN_LENGTH)
    .max(INSTANCE_TOKEN_MAX_LENGTH),
});

export type OpenSessionBody = z.infer<typeof openSessionBodySchema>;
