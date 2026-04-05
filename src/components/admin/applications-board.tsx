"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Application, Vacancy } from "@/types";
import {
  listAdminApplications,
  listAdminVacancies
} from "@/lib/firebase/firestore-services";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants/app";
import { formatDate } from "@/lib/utils/format";

export function ApplicationsBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filters, setFilters] = useState({
    vacancyId: "",
    status: "",
    comuna: "",
    date: "",
    availability: "",
    experience: ""
  });

  useEffect(() => {
    Promise.all([listAdminApplications(), listAdminVacancies()]).then(
      ([nextApplications, nextVacancies]) => {
        setApplications(nextApplications);
        setVacancies(nextVacancies);
      }
    );
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((item) => {
      const dateText = formatDate(item.appliedAt);

      return (
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

  return (
    <div className="grid">
      <section className="card" style={{ padding: "1rem" }}>
        <div className="three-columns">
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Teléfono</th>
                <th>Comuna</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/applications/${item.id}`}>{item.fullName}</Link>
                  </td>
                  <td>{item.vacancyTitle}</td>
                  <td>{item.phone}</td>
                  <td>{item.comuna}</td>
                  <td>{formatDate(item.appliedAt)}</td>
                  <td>
                    <span className="status-badge">
                      {APPLICATION_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td>{item.score ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

