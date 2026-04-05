"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Vacancy } from "@/types";
import { getVacancyBySlug } from "@/lib/firebase/firestore-services";

export function VacancyDetail({ slug }: { slug: string }) {
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVacancyBySlug(slug)
      .then(setVacancy)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container section">
        <div className="card" style={{ padding: "2rem" }}>
          Cargando detalle de la vacante...
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="container section">
        <div className="card" style={{ padding: "2rem" }}>
          La vacante no existe o ya no está activa.
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container grid">
          <article className="card" style={{ padding: "2rem" }}>
            <span className="pill">{vacancy.location}</span>
            <h1>{vacancy.title}</h1>
            <p className="muted">{vacancy.description}</p>

            <div className="three-columns" style={{ margin: "1.5rem 0" }}>
              <div className="card" style={{ padding: "1rem" }}>
                <strong>Horario</strong>
                <p className="muted">{vacancy.schedule}</p>
              </div>
              <div className="card" style={{ padding: "1rem" }}>
                <strong>Ubicación</strong>
                <p className="muted">{vacancy.location}</p>
              </div>
              <div className="card" style={{ padding: "1rem" }}>
                <strong>Renta</strong>
                <p className="muted">{vacancy.salary}</p>
              </div>
            </div>

            <div className="two-columns">
              <section>
                <h2>Funciones del puesto</h2>
                <ul>
                  {vacancy.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h2>Requisitos</h2>
                <ul>
                  {vacancy.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link className="btn btn-primary" href={`/apply/${vacancy.id}`}>
                Postular ahora
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

