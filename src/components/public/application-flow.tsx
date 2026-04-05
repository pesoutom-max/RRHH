"use client";

import { useEffect, useState } from "react";

import type { Vacancy } from "@/types";
import { getVacancyById } from "@/lib/firebase/firestore-services";

import { ApplicationForm } from "./application-form";

export function ApplicationFlow({ vacancyId }: { vacancyId: string }) {
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVacancyById(vacancyId)
      .then(setVacancy)
      .finally(() => setLoading(false));
  }, [vacancyId]);

  if (loading) {
    return (
      <div className="container section">
        <div className="card" style={{ padding: "2rem" }}>
          Cargando vacante...
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="container section">
        <div className="card" style={{ padding: "2rem" }}>
          No se encontró la vacante solicitada.
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container grid">
          <article className="card" style={{ padding: "2rem" }}>
            <span className="pill">{vacancy.title}</span>
            <h1>Formulario de postulación</h1>
            <p className="muted">
              Completa la información en pasos breves. Tu postulación se guardará
              en Firestore y se notificará al administrador al finalizar.
            </p>
          </article>
          <ApplicationForm vacancy={vacancy} />
        </div>
      </section>
    </main>
  );
}

