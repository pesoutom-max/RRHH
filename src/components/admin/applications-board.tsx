"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Application, Vacancy } from "@/types";
import {
  checkCvFilesExist,
  deleteApplication,
  listAdminApplications,
  listAdminVacancies
} from "@/lib/firebase/firestore-services";
import {
  APPLICATION_STATUS_CLASSNAMES,
  APPLICATION_STATUS_LABELS
} from "@/lib/constants/app";
import { formatDate } from "@/lib/utils/format";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesNameSearch(fullName: string, query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const normalizedName = normalizeSearchText(fullName);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return terms.every((term) => normalizedName.includes(term));
}

export function ApplicationsBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [cvAvailability, setCvAvailability] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    name: "",
    vacancyId: "",
    status: "",
    comuna: "",
    date: "",
    availability: "",
    experience: ""
  });

  useEffect(() => {
    async function load() {
      const [nextApplications, nextVacancies] = await Promise.all([
        listAdminApplications(),
        listAdminVacancies()
      ]);

      try {
        const nextCvAvailability = await checkCvFilesExist(
          nextApplications.map((item) => item.cvFileUrl)
        );
        setCvAvailability(nextCvAvailability);
      } catch {
        setCvAvailability({});
      }

        setApplications(nextApplications);
        setVacancies(nextVacancies);
        setLoading(false);
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((item) => {
      const dateText = formatDate(item.appliedAt);

      return (
        matchesNameSearch(item.fullName, filters.name) &&
        (!filters.vacancyId || item.vacancyId === filters.vacancyId) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.comuna ||
          item.comuna.toLowerCase().includes(filters.comuna.toLowerCase())) &&
        (!filters.date || dateText.includes(filters.date)) &&
        (!filters.availability ||
          item.availability.toLowerCase().includes(filters.availability.toLowerCase())) &&
        (!filters.experience ||
          item.experienceSummary
            .toLowerCase()
            .includes(filters.experience.toLowerCase()))
      );
    });
  }, [applications, filters]);

  async function handleDelete(applicationId: string, fullName: string) {
    const confirmed = window.confirm(
      `¿Eliminar la postulación de ${fullName}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(applicationId);

    try {
      await deleteApplication(applicationId);
      setApplications((current) => current.filter((item) => item.id !== applicationId));
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="grid">
      <section className="card" style={{ padding: "1rem" }}>
        <div className="three-columns">
          <div className="field">
            <label>Nombre postulante</label>
            <input
              onChange={(event) =>
                setFilters((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Ej. María Pérez"
              value={filters.name}
            />
          </div>

          <div className="field">
            <label>Vacante</label>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, vacancyId: event.target.value }))
              }
              value={filters.vacancyId}
            >
              <option value="">Todas</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>
                  {vacancy.title}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Estado</label>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              value={filters.status}
            >
              <option value="">Todos</option>
              {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Comuna</label>
            <input
              onChange={(event) =>
                setFilters((current) => ({ ...current, comuna: event.target.value }))
              }
              value={filters.comuna}
            />
          </div>

          <div className="field">
            <label>Fecha</label>
            <input
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: event.target.value }))
              }
              placeholder="Ej. 03-04-2026"
              value={filters.date}
            />
          </div>

          <div className="field">
            <label>Disponibilidad</label>
            <input
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  availability: event.target.value
                }))
              }
              value={filters.availability}
            />
          </div>

          <div className="field">
            <label>Experiencia</label>
            <input
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  experience: event.target.value
                }))
              }
              value={filters.experience}
            />
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: "1rem 1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Postulaciones recibidas</h2>
            <p className="muted" style={{ margin: 0 }}>
              Revisa cada ficha desde el botón "Ver ficha".
            </p>
          </div>
          <span className="pill">{filtered.length} registros</span>
        </div>
        {loading ? (
          <div className="card" style={{ padding: "1.5rem" }}>
            Cargando postulaciones...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem" }}>
            No hay postulaciones que coincidan con los filtros.
          </div>
        ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Fecha postulación</th>
                <th>Último ingreso</th>
                <th>Estado</th>
                <th>Score</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="application-name-cell">
                      <span>{item.fullName}</span>
                      {item.cvFileUrl && cvAvailability[item.cvFileUrl] ? (
                        <span className="cv-badge">CV adjunto</span>
                      ) : null}
                    </div>
                  </td>
                  <td>{item.vacancyTitle}</td>
                  <td>{formatDate(item.appliedAt)}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    <span className={APPLICATION_STATUS_CLASSNAMES[item.status]}>
                      {APPLICATION_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td>
                    <ScoreBadge score={item.score} />
                  </td>
                  <td>
                    <div className="notes-preview">
                      {item.adminNotes?.trim() ? item.adminNotes : "Sin notas"}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                        flexWrap: "wrap"
                      }}
                    >
                      <Link className="btn btn-secondary" href={`/applications/${item.id}`}>
                        Ver ficha
                      </Link>
                      <button
                        className="btn btn-ghost"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id ?? "", item.fullName)}
                        style={{ color: "#b42318" }}
                        type="button"
                      >
                        {deletingId === item.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (typeof score !== "number") {
    return <>-</>;
  }

  return (
    <span className={score >= 8 ? "score-badge score-badge--high" : "score-badge"}>
      {score}/10
    </span>
  );
}
