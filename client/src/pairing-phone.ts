export const PAIRING_PHONE_MESSAGE = "Informe o DDI e o DDD, só números";

export function pairingPhoneError(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) {
    return null;
  }
  if (!/^\d{8,15}$/.test(digits)) {
    return PAIRING_PHONE_MESSAGE;
  }
  return null;
}
