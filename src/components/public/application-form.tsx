"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { Vacancy } from "@/types";
import { submitApplication } from "@/lib/firebase/firestore-services";
import {
  applicationSchema,
  type ApplicationFormValues
} from "@/lib/validations/application";
import { formatRut } from "@/lib/validations/rut";

const steps = [
  { id: 1, title: "Datos personales" },
  { id: 2, title: "Experiencia y disponibilidad" },
  { id: 3, title: "Preguntas de filtro" },
  { id: 4, title: "Revisión final" }
];

const defaultValues: ApplicationFormValues = {
  fullName: "",
  rut: "",
  phone: "",
  email: "",
  comuna: "",
  age: 18,
  experienceSummary: "",
  lastJob: "",
  availability: "",
  transportToWork: "",
  expectedSalary: "",
  canWorkSundaysOrHolidays: false,
  availableFrom: "",
  knowsBrandAndBusiness: "",
  knowsInstagram: "",
  consentAccepted: false
};

const optionalFieldLabels: Array<{
  key: keyof ApplicationFormValues;
  label: string;
  step: 2 | 3;
}> = [
  { key: "experienceSummary", label: "Resumen de experiencia", step: 2 },
  { key: "lastJob", label: "Último trabajo", step: 2 },
  { key: "expectedSalary", label: "Pretensión de renta", step: 2 },
  { key: "availableFrom", label: "Fecha disponible de inicio", step: 3 },
  { key: "knowsBrandAndBusiness", label: "Conocimiento de la marca", step: 3 },
  { key: "knowsInstagram", label: "Conocimiento del Instagram", step: 3 }
];

export function ApplicationForm({ vacancy }: { vacancy: Vacancy }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const submissionLockRef = useRef(false);

  const {
    register,
    watch,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors }
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues
  });

  const values = watch();

  const reviewItems = useMemo(
    () => [
      ["Nombre completo", values.fullName],
      ["RUT", values.rut],
      ["Teléfono", values.phone],
      ["Correo", values.email],
      ["Comuna", values.comuna],
      ["Edad", String(values.age)],
      ["Último trabajo", values.lastJob],
      ["Disponibilidad", values.availability],
      ["Pretensión de renta", values.expectedSalary],
      ["Puede trabajar domingos y festivos", values.canWorkSundaysOrHolidays ? "Sí" : "No"],
      ["Cuándo podría comenzar", values.availableFrom],
      ["Nos conoce y sabe lo que hacemos", values.knowsBrandAndBusiness],
      ["Sabe cuál es nuestro Instagram o si nos sigue", values.knowsInstagram]
    ],
    [values]
  );

  const missingOptionalFields = useMemo(
    () =>
      optionalFieldLabels.filter(({ key }) => {
        const value = values[key];
        return typeof value === "string" && value.trim().length === 0;
      }),
    [values]
  );

  const missingOptionalFieldsByStep = useMemo(
    () => ({
      2: missingOptionalFields.filter((item) => item.step === 2),
      3: missingOptionalFields.filter((item) => item.step === 3)
    }),
    [missingOptionalFields]
  );

  async function goNext() {
    const validByStep = {
      1: await trigger([
        "fullName",
        "rut",
        "phone",
        "email",
        "comuna",
        "age"
      ]),
      2: await trigger([
        "availability",
        "transportToWork",
      ]),
      3: await trigger(["consentAccepted"]),
      4: true
    };

    if (validByStep[currentStep as keyof typeof validByStep]) {
      if (currentStep === 3) {
        setReviewConfirmed(false);
        setSubmissionError(null);
      }
      setCurrentStep((value) => Math.min(value + 1, 4));
    }
  }

  async function onSubmit(formValues: ApplicationFormValues) {
    if (currentStep !== 4) return;
    if (submissionLockRef.current) return;
    if (!reviewConfirmed) {
      setSubmissionError(
        "Confirma en el paso final que revisaste la postulación antes de enviarla."
      );
      return;
    }

    try {
      submissionLockRef.current = true;
      setSubmitting(true);
      setSubmissionError(null);
      await submitApplication(vacancy, formValues, cvFile);
      router.push("/application/success");
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "No fue posible enviar la postulación. Intenta nuevamente."
      );
    } finally {
      submissionLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          marginBottom: "1.5rem"
        }}
      >
        {steps.map((step) => (
          <div
            key={step.id}
            className="card"
            style={{
              padding: "0.9rem",
              background: currentStep === step.id ? "var(--accent)" : "white"
            }}
          >
            <strong>
              Paso {step.id}
            </strong>
            <div className="muted">{step.title}</div>
          </div>
        ))}
      </div>

      <form className="grid" onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 ? (
          <div className="two-columns">
            <Field label="Nombre completo" error={errors.fullName?.message}>
              <input {...register("fullName")} />
            </Field>
            <Field label="RUT" error={errors.rut?.message}>
              <input
                {...register("rut")}
                onBlur={(event) => setValue("rut", formatRut(event.target.value))}
              />
            </Field>
            <Field label="Teléfono" error={errors.phone?.message}>
              <input {...register("phone")} />
            </Field>
            <Field label="Correo" error={errors.email?.message}>
              <input type="email" {...register("email")} />
            </Field>
            <Field label="Comuna donde vive" error={errors.comuna?.message}>
              <input {...register("comuna")} />
            </Field>
            <Field label="Edad" error={errors.age?.message}>
              <input type="number" {...register("age", { valueAsNumber: true })} />
            </Field>
            <Field label="CV (PDF o Word)">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setCvFile(event.target.files?.[0] ? event.target.files[0] : null)
                }
              />
            </Field>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid">
            {missingOptionalFieldsByStep[2].length > 0 ? (
              <StepWarning items={missingOptionalFieldsByStep[2]} />
            ) : null}
            <Field
              label="Resumen de experiencia"
              error={errors.experienceSummary?.message}
            >
              <textarea {...register("experienceSummary")} />
            </Field>
            <div className="two-columns">
              <Field label="Último trabajo" error={errors.lastJob?.message}>
                <input {...register("lastJob")} />
              </Field>
              <Field label="Disponibilidad" error={errors.availability?.message}>
                <input {...register("availability")} />
              </Field>
              <Field
                label="Cómo llegarías al trabajo"
                error={errors.transportToWork?.message}
              >
                <input {...register("transportToWork")} />
              </Field>
              <Field
                label="Pretensión de renta"
                error={errors.expectedSalary?.message}
              >
                <input {...register("expectedSalary")} />
              </Field>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid">
            {missingOptionalFieldsByStep[3].length > 0 ? (
              <StepWarning items={missingOptionalFieldsByStep[3]} />
            ) : null}
            {!values.consentAccepted ? (
              <div
                className="card"
                style={{
                  padding: "1rem",
                  border: "1px solid #f1c36d",
                  background: "#fff8ea"
                }}
              >
                <strong>Importante</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  No podrás enviar la postulación si no marcas la autorización para
                  el uso de tus datos personales.
                </p>
              </div>
            ) : null}
            <Toggle
              label="¿Puedes trabajar domingos y festivos?"
              registration={register("canWorkSundaysOrHolidays")}
            />
            <Field
              label="¿Cuándo podrías comenzar?"
              error={errors.availableFrom?.message}
            >
              <input {...register("availableFrom")} />
            </Field>
            <Field
              label="¿Nos conoces, sabes de nosotros y lo que hacemos?"
              error={errors.knowsBrandAndBusiness?.message}
            >
              <textarea {...register("knowsBrandAndBusiness")} />
            </Field>
            <Field
              label="¿Sabés cuál es nuestro Instagram, nos sigues?"
              error={errors.knowsInstagram?.message}
            >
              <textarea {...register("knowsInstagram")} />
            </Field>
            <label
              style={{
                display: "flex",
                gap: "0.7rem",
                alignItems: "flex-start",
                padding: "1rem",
                border: "1px solid var(--line)",
                borderRadius: 16
              }}
            >
              <input type="checkbox" {...register("consentAccepted")} />
              <span>
                Acepto el tratamiento de mis datos personales exclusivamente para
                este proceso de selección.
              </span>
            </label>
            {errors.consentAccepted?.message ? (
              <span className="field-error">{errors.consentAccepted.message}</span>
            ) : null}
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="grid">
            <div className="card" style={{ padding: "1.25rem" }}>
              <h2 style={{ marginTop: 0 }}>Revisa tu información</h2>
              <p
                className="muted"
                style={{
                  marginTop: 0,
                  marginBottom: "1rem",
                  fontSize: "1rem"
                }}
              >
                Este es el paso final de revisión. Antes de enviar, vuelve atrás si
                quieres completar o corregir información.
              </p>
              <div className="two-columns">
                {reviewItems.map(([label, value]) => (
                  <div key={label}>
                    <strong>{label}</strong>
                    <p className="muted">{value || "No informado"}</p>
                  </div>
                ))}
              </div>
              <p className="muted">
                Si todo está correcto, presiona enviar. La postulación se guardará
                realmente en la base de datos.
              </p>
              {missingOptionalFields.length > 0 ? (
                <div
                  className="card"
                  style={{
                    padding: "1rem",
                    border: "1px solid #f1c36d",
                    background: "#fff8ea"
                  }}
                >
                  <strong>Advertencia</strong>
                  <p className="muted" style={{ marginBottom: "0.5rem" }}>
                    Vas a postular con preguntas sin contestar. Puedes continuar,
                    pero estos datos quedarán pendientes:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                    {missingOptionalFields.map((item) => (
                      <li key={item.key}>{item.label}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <label
                style={{
                  display: "flex",
                  gap: "0.7rem",
                  alignItems: "flex-start",
                  padding: "1rem",
                  border: "1px solid var(--line)",
                  borderRadius: 16
                }}
              >
                <input
                  checked={reviewConfirmed}
                  onChange={(event) => setReviewConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  Confirmo que revisé esta postulación y quiero enviarla ahora.
                </span>
              </label>
            </div>

            {submissionError ? (
              <div className="card" style={{ padding: "1rem", color: "var(--danger)" }}>
                {submissionError}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}
        >
          <Link className="btn btn-ghost" href={`/vacancies/${vacancy.slug}`}>
            Volver al aviso
          </Link>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {currentStep > 1 ? (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSubmissionError(null);
                  setCurrentStep((value) => Math.max(1, value - 1));
                }}
                type="button"
              >
                Paso anterior
              </button>
            ) : null}

            {currentStep < 4 ? (
              <button className="btn btn-primary" onClick={goNext} type="button">
                Continuar
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={submitting || !reviewConfirmed}
                type="submit"
              >
                {submitting
                  ? "Enviando postulación..."
                  : missingOptionalFields.length > 0
                    ? "Postular con datos pendientes"
                    : "Enviar postulación"}
              </button>
            )}
          </div>
        </div>
      </form>
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

function Toggle({
  label,
  registration
}: {
  label: string;
  registration: ReturnType<
    ReturnType<typeof useForm<ApplicationFormValues>>["register"]
  >;
}) {
  return (
    <label
      className="card"
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        padding: "1rem"
      }}
    >
      <input
        type="checkbox"
        {...registration}
      />
      <span>{label}</span>
    </label>
  );
}

function StepWarning({
  items
}: {
  items: Array<{ key: keyof ApplicationFormValues; label: string }>;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "1rem",
        border: "1px solid #f1c36d",
        background: "#fff8ea"
      }}
    >
      <strong>Advertencia</strong>
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        Puedes seguir sin contestar estas preguntas, pero la postulación quedará
        con información pendiente:
      </p>
      <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
        {items.map((item) => (
          <li key={item.key}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
