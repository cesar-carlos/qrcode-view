import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().regex(/^\d{8,15}$/));

export const connectBodySchema = z.object({
  phone: phoneSchema.optional(),
});

// 10–11 digits are a Brazilian national number. 12–15 already include a country code.
const pairingPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .transform((digits) => (/^\d{10,11}$/.test(digits) ? `55${digits}` : digits))
  .pipe(z.string().regex(/^[1-9]\d{11,14}$/));

export const pairBodySchema = z.object({
  phone: pairingPhoneSchema,
});

export type ConnectBody = z.infer<typeof connectBodySchema>;
export type PairBody = z.infer<typeof pairBodySchema>;
