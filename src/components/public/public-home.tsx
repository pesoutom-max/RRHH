"use client";

import { useEffect, useState } from "react";

import type { Vacancy } from "@/types";
import { getActiveVacancies } from "@/lib/firebase/firestore-services";

import { VacancyCard } from "./vacancy-card";

export function PublicHome() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveVacancies()
      .then(setVacancies)
      .catch((nextError) => {
        console.error("No se pudieron cargar las vacantes activas.", nextError);
        setError("No pudimos cargar las vacantes en este momento.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell">
      <section className="public-hero">
        <div className="container public-hero-grid">
          <div className="card" style={{ padding: "2rem" }}>
            <span className="pill">Reclutamiento activo</span>
            <h1 style={{ fontSize: "clamp(2.1rem, 5vw, 4rem)", marginBottom: 12 }}>
              Publica vacantes y recibe postulaciones reales en un solo flujo.
            </h1>
            <p className="muted" style={{ fontSize: "1.05rem", maxWidth: 700 }}>
              Esta plataforma permite administrar ofertas laborales, recibir
              postulaciones con CV, revisar candidatos y mantener un seguimiento
              ordenado y seguro desde Firebase.
            </p>
          </div>

          <aside className="card public-summary">
            <h2 style={{ marginTop: 0 }}>Lo que queda resuelto</h2>
            <div className="grid">
              <span className="muted">Vacantes múltiples con estados.</span>
              <span className="muted">Formulario multi paso con validaciones.</span>
              <span className="muted">Guardado real en Firestore y CV en Storage.</span>
              <span className="muted">Panel admin con filtro, score y seguimiento.</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Vacantes activas</h2>
              <p className="muted">Postulaciones abiertas para publicación real.</p>
            </div>
          </div>

          {loading ? (
            <div className="card" style={{ padding: "2rem" }}>
              Cargando vacantes...
            </div>
          ) : error ? (
            <div className="card" style={{ padding: "2rem" }}>
              {error}
            </div>
          ) : vacancies.length === 0 ? (
            <div className="card" style={{ padding: "2rem" }}>
              No hay vacantes activas publicadas todavía.
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {vacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
