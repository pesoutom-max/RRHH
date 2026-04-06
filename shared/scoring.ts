import type { Application } from "./models";

const nearbyCommunes = new Set([
  "santiago",
  "estacion central",
  "san miguel",
  "macul",
  "ñuñoa",
  "nunoa",
  "la florida",
  "providencia",
  "san joaquin",
  "independencia"
]);

export function calculateApplicationScore(
  application: Pick<
    Application,
    | "comuna"
    | "availability"
    | "experienceSummary"
  >
): number {
  let score = 0;

  if (nearbyCommunes.has(normalize(application.comuna))) score += 1;
  if (application.availability.trim().length >= 3) score += 2;
  if (application.experienceSummary.trim().length >= 40) score += 2;

  return score;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
