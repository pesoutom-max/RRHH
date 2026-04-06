"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Application } from "@/types";
import { auth } from "@/lib/firebase/client";
import {
  deleteApplication,
  getApplicationById,
  updateApplicationAdminState
} from "@/lib/firebase/firestore-services";
import {
  APPLICATION_STATUS_CLASSNAMES,
  APPLICATION_STATUS_LABELS
} from "@/lib/constants/app";
import { formatDate } from "@/lib/utils/format";

export function ApplicationDetail({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Application["status"]>("new");
  const [saving, setSaving] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getApplicationById(applicationId).then((item) => {
      setApplication(item);
      setNotes(item?.adminNotes ?? "");
      setStatus(item?.status ?? "new");
    });
  }, [applicationId]);

  if (!application) {
    return <div className="card" style={{ padding: "2rem" }}>Cargando ficha...</div>;
  }

  return (
    <div className="grid">
      <section className="card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link className="btn btn-ghost" href="/applications">
            Volver a postulaciones
          </Link>
        </div>
        <div className="two-columns">
          <DetailItem label="Nombre" value={application.fullName} />
          <DetailItem label="Cargo" value={application.vacancyTitle} />
          <DetailItem label="RUT" value={application.rut} />
          <DetailItem label="Correo" value={application.email} />
          <DetailItem label="Teléfono" value={application.phone} />
          <DetailItem label="Comuna" value={application.comuna} />
          <DetailItem label="Edad" value={String(application.age)} />
          <DetailItem label="Disponibilidad" value={application.availability} />
          <DetailItem
            label="Postulada el"
            value={formatDate(application.appliedAt)}
          />
          <DetailItem
            label="Cómo llegaría"
            value={application.transportToWork}
          />
          <DetailItem
            label="Pretensión de renta"
            value={application.expectedSalary}
          />
          <DetailItem label="Score" value={String(application.score ?? "-")} />
          <DetailItem
            label="Curriculum"
            value={application.cvFileUrl ? "Adjunto" : "No adjunto"}
          />
          <StatusDetailItem label="Estado" status={application.status} />
        </div>
      </section>

      <section className="two-columns">
        <article className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>Experiencia y respuestas</h2>
          <DetailItem
            label="Resumen de experiencia"
            value={application.experienceSummary}
          />
          <DetailItem label="Último trabajo" value={application.lastJob} />
          <DetailItem
            label="Puede trabajar domingos o festivos"
            value={application.answers.canWorkSundaysOrHolidays ? "Sí" : "No"}
          />
          <DetailItem
            label="Inicio disponible desde"
            value={application.answers.availableFrom}
          />
          <DetailItem
            label="Conoce la marca y lo que hacemos"
            value={application.answers.knowsBrandAndBusiness}
          />
          <DetailItem
            label="Conoce o sigue el Instagram"
            value={application.answers.knowsInstagram}
          />
        </article>

        <article className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>Gestión del proceso</h2>
          <div className="field">
            <label>Estado</label>
            <select
              onChange={(event) =>
                setStatus(event.target.value as Application["status"])
              }
              value={status}
            >
              {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Notas internas</label>
            <textarea onChange={(event) => setNotes(event.target.value)} value={notes} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a className="btn btn-secondary" href={`tel:${application.phone}`}>
              Ver teléfono
            </a>
            <button
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(application.email)}
              type="button"
            >
              Copiar email
            </button>
            {application.cvFileUrl ? (
              <button
                className="btn btn-secondary"
                disabled={cvLoading}
                onClick={async () => {
                  setCvLoading(true);
                  const token = await auth.currentUser?.getIdToken();
                  const response = await fetch("/api/admin/cv-url", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ filePath: application.cvFileUrl })
                  });
                  const data = (await response.json()) as { url?: string };

                  if (data.url) {
                    window.open(data.url, "_blank", "noopener,noreferrer");
                  }

                  setCvLoading(false);
                }}
                type="button"
              >
                {cvLoading ? "Abriendo CV..." : "Abrir CV"}
              </button>
            ) : null}
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await updateApplicationAdminState(applicationId, {
                  adminNotes: notes,
                  status
                });
                router.push("/applications");
                router.refresh();
              }}
              type="button"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={deleting}
              onClick={async () => {
                const confirmed = window.confirm(
                  `¿Eliminar la postulación de ${application.fullName}? Esta acción no se puede deshacer.`
                );

                if (!confirmed) {
                  return;
                }

                setDeleting(true);
                await deleteApplication(applicationId);
                router.push("/applications");
                router.refresh();
              }}
              style={{ color: "#b42318" }}
              type="button"
            >
              {deleting ? "Eliminando..." : "Eliminar postulación"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <strong>{label}</strong>
      <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
        {value || "No informado"}
      </p>
    </div>
  );
}

function StatusDetailItem({
  label,
  status
}: {
  label: string;
  status: Application["status"];
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <strong>{label}</strong>
      <div style={{ marginTop: "0.45rem" }}>
        <span className={APPLICATION_STATUS_CLASSNAMES[status]}>
          {APPLICATION_STATUS_LABELS[status]}
        </span>
      </div>
    </div>
  );
}
