import Link from "next/link";

import type { Vacancy } from "@/types";

export function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  return (
    <article className="card public-summary">
      <div style={{ display: "grid", gap: "0.9rem" }}>
        <div>
          <span className="pill">{vacancy.location}</span>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.35rem" }}>{vacancy.title}</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            {vacancy.description}
          </p>
        </div>
        <div className="grid" style={{ gap: "0.55rem" }}>
          <span className="muted">Horario: {vacancy.schedule}</span>
          <span className="muted">Renta: {vacancy.salary}</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="btn btn-secondary" href={`/vacancies/${vacancy.slug}`}>
            Ver detalle
          </Link>
          <Link className="btn btn-primary" href={`/apply/${vacancy.id}`}>
            Postular ahora
          </Link>
        </div>
      </div>
    </article>
  );
}

