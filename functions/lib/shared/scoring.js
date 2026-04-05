"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateApplicationScore = calculateApplicationScore;
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
function calculateApplicationScore(application) {
    let score = 0;
    if (application.canWorkWeekends)
        score += 2;
    if (application.hasCustomerServiceExperience)
        score += 2;
    if (application.hasFoodHandlingExperience)
        score += 2;
    if (application.canStartImmediately)
        score += 2;
    if (nearbyCommunes.has(normalize(application.comuna)))
        score += 1;
    if (application.motivation.trim().length >= 80)
        score += 1;
    return score;
}
function normalize(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
//# sourceMappingURL=scoring.js.map