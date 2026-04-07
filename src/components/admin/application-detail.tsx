"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Application } from "@/types";
import {
  checkCvFilesExist,
  deleteApplication,
  getSignedCvUrl,
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
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvVerified, setCvVerified] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getApplicationById(applicationId).then(async (item) => {
      setApplication(item);
      setNotes(item?.adminNotes ?? "");
      setStatus(item?.status ?? "new");
      setScore(
        typeof item?.score === "number" && item.score >= 1 && item.score <= 10
          ? item.score
          : null
      );
      setCvError(null);

      if (item?.cvFileUrl) {
        try {
          const availability = await checkCvFilesExist([item.cvFileUrl]);
          setCvVerified(Boolean(availability[item.cvFileUrl]));
        } catch {
          setCvVerified(false);
        }
      } else {
        setCvVerified(false);
      }
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
          <ScoreDetailItem score={application.score} />
          <DetailItem
            label="Curriculum"
            value={
              application.cvFileUrl
                ? cvVerified
                  ? "Adjunto verificado"
                  : "No disponible"
                : "No adjunto"
            }
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
            <label>Score manual</label>
            <select
              onChange={(event) =>
                setScore(event.target.value ? Number(event.target.value) : null)
              }
              value={score ?? ""}
            >
              <option value="">Sin score</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "(peor)" : value === 10 ? "(mejor)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Notas internas</label>
            <textarea onChange={(event) => setNotes(event.target.value)} value={notes} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              className="btn btn-secondary"
              href={`https://wa.me/${toWhatsappPhone(application.phone)}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir WhatsApp
            </a>
            <button
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(application.email)}
              type="button"
            >
              Copiar email
            </button>
            {cvVerified && application.cvFileUrl ? (
              <button
                className="btn btn-secondary"
                disabled={cvLoading}
                onClick={async () => {
                  setCvLoading(true);
                  setCvError(null);

                  try {
                    const url = await getSignedCvUrl(application.cvFileUrl);
                    window.open(url, "_blank", "noopener,noreferrer");
                  } catch (error) {
                    setCvError(
                      error instanceof Error
                        ? error.message
                        : "No fue posible abrir el CV."
                    );
                  } finally {
                    setCvLoading(false);
                  }
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
                  score,
                  status
                });
                router.push("/applications");
                router.refresh();
              }}
              type="button"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <Link className="btn btn-ghost" href="/applications">
              Salir
            </Link>
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
          {cvError ? (
            <div className="field-error" style={{ marginTop: "0.75rem" }}>
              {cvError}
            </div>
          ) : null}
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

function ScoreDetailItem({ score }: { score: number | null }) {
  const hasHighScore = typeof score === "number" && score >= 8;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <strong>Score</strong>
      <div style={{ marginTop: "0.45rem" }}>
        {typeof score === "number" ? (
          <span className={hasHighScore ? "score-badge score-badge--high" : "score-badge"}>
            {score}/10
          </span>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            No informado
          </p>
        )}
      </div>
    </div>
  );
}

function toWhatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.startsWith("56") ? digits : `56${digits.replace(/^0+/, "")}`;
}
