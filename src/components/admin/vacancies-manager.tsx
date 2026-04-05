"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { Vacancy } from "@/types";
import {
  createVacancy,
  listAdminVacancies,
  updateVacancy
} from "@/lib/firebase/firestore-services";
import {
  vacancySchema,
  type VacancyFormValues
} from "@/lib/validations/vacancy";

export function VacanciesManager() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilitiesText: "",
      requirementsText: "",
      schedule: "",
      location: "",
      salary: "",
      status: "active"
    }
  });

  async function refresh() {
    const items = await listAdminVacancies();
    setVacancies(items);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="grid">
      <section className="card" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>
          {editing ? "Editar vacante" : "Publicar nueva vacante"}
        </h2>
        <form
          className="grid"
          onSubmit={handleSubmit(async (values) => {
            setSubmitting(true);
            if (editing?.id) {
              await updateVacancy(editing.id, values);
            } else {
              await createVacancy(values);
            }
            await refresh();
            setEditing(null);
            reset();
            setSubmitting(false);
          })}
        >
          <div className="two-columns">
            <Field error={errors.title?.message} label="Título del cargo">
              <input {...register("title")} />
            </Field>
            <Field error={errors.status?.message} label="Estado">
              <select {...register("status")}>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="closed">Cerrada</option>
              </select>
            </Field>
            <Field error={errors.schedule?.message} label="Horario">
              <input {...register("schedule")} />
            </Field>
            <Field error={errors.location?.message} label="Ubicación">
              <input {...register("location")} />
            </Field>
            <Field error={errors.salary?.message} label="Renta">
              <input {...register("salary")} />
            </Field>
          </div>

          <Field error={errors.description?.message} label="Descripción">
            <textarea {...register("description")} />
          </Field>
          <Field
            error={errors.responsibilitiesText?.message}
            label="Funciones del puesto (una por línea)"
          >
            <textarea {...register("responsibilitiesText")} />
          </Field>
          <Field
            error={errors.requirementsText?.message}
            label="Requisitos (uno por línea)"
          >
            <textarea {...register("requirementsText")} />
          </Field>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Guardando..." : editing ? "Actualizar vacante" : "Crear vacante"}
            </button>
            {editing ? (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(null);
                  reset();
                }}
                type="button"
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card" style={{ padding: "1rem 1.25rem" }}>
        <h2>Vacantes registradas</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Ubicación</th>
                <th>Horario</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((vacancy) => (
                <tr key={vacancy.id}>
                  <td>{vacancy.title}</td>
                  <td>{vacancy.location}</td>
                  <td>{vacancy.schedule}</td>
                  <td>{vacancy.status}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(vacancy);
                        reset({
                          title: vacancy.title,
                          description: vacancy.description,
                          responsibilitiesText: vacancy.responsibilities.join("\n"),
                          requirementsText: vacancy.requirements.join("\n"),
                          schedule: vacancy.schedule,
                          location: vacancy.location,
                          salary: vacancy.salary,
                          status: vacancy.status
                        });
                      }}
                      type="button"
                    >
                      Editar
                    </button>
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

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

