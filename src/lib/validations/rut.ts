export function normalizeRut(value: string) {
  return value.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
}

export function formatRut(value: string) {
  const normalized = normalizeRut(value);
  if (normalized.length < 2) return value;

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);

  return `${body}-${dv}`;
}

export function isValidRut(value: string) {
  const rut = normalizeRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);
  const expectedDv =
    expected === 11 ? "0" : expected === 10 ? "K" : String(expected);

  return dv === expectedDv;
}

