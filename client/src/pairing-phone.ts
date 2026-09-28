export const PAIRING_PHONE_MESSAGE = "Informe o DDI e o DDD, só números";
export const PAIRING_PHONE_MAX_DIGITS = 15;

export function pairingPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, PAIRING_PHONE_MAX_DIGITS);
}

/** Digits Evolution GO accepts: country code 55, area code, and the number. */
export function normalizePairingPhone(value: string): string | null {
  const digits = pairingPhoneDigits(value);
  if (/^55\d{10,11}$/.test(digits)) {
    return digits;
  }
  if (/^\d{10,11}$/.test(digits)) {
    return `55${digits}`;
  }
  return null;
}

export function pairingPhoneError(value: string): string | null {
  const digits = pairingPhoneDigits(value);
  if (digits.length === 0) {
    return null;
  }
  if (normalizePairingPhone(digits) === null) {
    return PAIRING_PHONE_MESSAGE;
  }
  return null;
}

export function formatPairingPhone(value: string): string {
  const digits = pairingPhoneDigits(value);
  if (digits.length === 0) {
    return "";
  }

  const normalized = normalizePairingPhone(digits) ?? digits;
  let country = "";
  let rest = normalized;
  if (normalized.startsWith("55") && normalized.length > 4) {
    country = "+55 ";
    rest = normalized.slice(2);
  }

  if (rest.length <= 2) {
    return `${country}${rest}`;
  }

  const area = rest.slice(0, 2);
  const local = rest.slice(2);
  if (local.length === 0) {
    return `${country}(${area}`;
  }
  if (local.length <= 4) {
    return `${country}(${area}) ${local}`;
  }
  if (local.length <= 8) {
    const split = local.length - 4;
    return `${country}(${area}) ${local.slice(0, split)}-${local.slice(split)}`;
  }
  return `${country}(${area}) ${local.slice(0, 5)}-${local.slice(5, 9)}${local.slice(9)}`;
}

export function formatPairingCode(code: string): string {
  const compact = code.replace(/[\s-]/g, "");
  if (compact.length <= 4) {
    return compact;
  }
  return compact.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}
