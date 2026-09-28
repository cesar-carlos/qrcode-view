import { z } from "zod";
import { INSTANCE_EVENTS } from "../../../shared/constants.js";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().regex(/^\d{8,15}$/));

export const connectBodySchema = z.object({
  phone: phoneSchema.optional(),
  webhookUrl: z.url().max(500).optional(),
  subscribe: z
    .array(z.enum(INSTANCE_EVENTS))
    .max(INSTANCE_EVENTS.length)
    .optional(),
});

const pairingPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().regex(/^55\d{10,11}$/));

export const pairBodySchema = z.object({
  phone: pairingPhoneSchema,
});

export type ConnectBody = z.infer<typeof connectBodySchema>;
export type PairBody = z.infer<typeof pairBodySchema>;
