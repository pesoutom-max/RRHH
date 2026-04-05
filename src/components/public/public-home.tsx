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
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ margin: 0 }}>Vacantes activas</h1>
            <p className="muted">Postulaciones abiertas para publicación real.</p>
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
