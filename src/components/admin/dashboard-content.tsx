"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Application } from "@/types";
import {
  checkCvFilesExist,
  getDashboardStats,
  listAdminApplications
} from "@/lib/firebase/firestore-services";
import {
  APPLICATION_STATUS_CLASSNAMES,
  APPLICATION_STATUS_LABELS
} from "@/lib/constants/app";
import { formatDate } from "@/lib/utils/format";

export function DashboardContent() {
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    reviewing: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  } | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [cvAvailability, setCvAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const [nextStats, nextApplications] = await Promise.all([
        getDashboardStats(),
        listAdminApplications()
      ]);

      const nextRecent = nextApplications.slice(0, 8);

      try {
        const nextCvAvailability = await checkCvFilesExist(
          nextRecent.map((item) => item.cvFileUrl)
        );
        setCvAvailability(nextCvAvailability);
      } catch {
        setCvAvailability({});
      }

      setStats(nextStats);
      setRecent(nextRecent);
    }

    load();
  }, []);

  if (!stats) {
    return <div className="card" style={{ padding: "2rem" }}>Cargando dashboard...</div>;
  }

  return (
    <div className="grid">
      <section className="stats-grid">
        {Object.entries(stats).map(([key, value]) => (
          <article className="card stats-card" key={key}>
            <span className="muted">
              {key === "total" ? "Total" : APPLICATION_STATUS_LABELS[key as keyof typeof APPLICATION_STATUS_LABELS]}
            </span>
            <h2 style={{ marginBottom: 0 }}>{value}</h2>
          </article>
        ))}
      </section>

      <section className="card" style={{ padding: "1rem 1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div>
            <h2 style={{ marginBottom: 4 }}>Últimas postulaciones</h2>
            <p className="muted">Acceso rápido a los ingresos más recientes.</p>
          </div>
          <Link className="btn btn-secondary" href="/applications">
            Ver todas
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="application-name-cell">
                      <Link href={`/applications/${item.id}`}>{item.fullName}</Link>
                      {item.cvFileUrl && cvAvailability[item.cvFileUrl] ? (
                        <span className="cv-badge">CV adjunto</span>
                      ) : null}
                    </div>
                  </td>
                  <td>{item.vacancyTitle}</td>
                  <td>{formatDate(item.appliedAt)}</td>
                  <td>
                    <span className={APPLICATION_STATUS_CLASSNAMES[item.status]}>
                      {APPLICATION_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td>
                    <ScoreBadge score={item.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
