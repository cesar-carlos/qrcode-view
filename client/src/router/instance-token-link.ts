const TOKEN_MIN_LENGTH = 8;
const TOKEN_MAX_LENGTH = 512;

export function readInstanceTokenLink(route: {
  params: { token?: string | string[] };
  query: { token?: string | null | (string | null)[] };
}): string | null {
  const candidate = firstValue(route.query.token) ?? firstValue(route.params.token);
  if (candidate === undefined) {
    return null;
  }
  const token = decodeToken(candidate).trim();
  if (token.length < TOKEN_MIN_LENGTH || token.length > TOKEN_MAX_LENGTH) {
    return null;
  }
  if (/[\s./\\]/.test(token)) {
    return null;
  }
  return token;
}

function firstValue(
  value: string | null | (string | null)[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

function decodeToken(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
