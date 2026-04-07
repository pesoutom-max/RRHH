export const APP_NAME = "Panel de Reclutamiento";
export const APPLICATION_STATUS_LABELS = {
  new: "Nueva",
  reviewing: "En revisión",
  reviewed: "Revisada",
  shortlisted: "Preseleccionada",
  rejected: "Rechazada",
  hired: "Contratada"
} as const;

export const APPLICATION_STATUS_CLASSNAMES = {
  new: "status-badge status-badge--new",
  reviewing: "status-badge status-badge--reviewing",
  reviewed: "status-badge status-badge--reviewed",
  shortlisted: "status-badge status-badge--shortlisted",
  rejected: "status-badge status-badge--rejected",
  hired: "status-badge status-badge--hired"
} as const;

export const VACANCY_STATUS_LABELS = {
  active: "Activa",
  inactive: "Inactiva",
  closed: "Cerrada"
} as const;
