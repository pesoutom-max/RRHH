import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

import { calculateApplicationScore } from "../../shared/scoring";
import type { Application } from "../../shared/models";

initializeApp();

const db = getFirestore();

export const onApplicationCreated = onDocumentCreated(
  "applications/{applicationId}",
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      logger.error("Evento recibido sin snapshot de aplicación.");
      return;
    }

    const applicationId = event.params.applicationId;
    const application = snapshot.data() as Application;
    const score = calculateApplicationScore(application);

    await snapshot.ref.update({
      score,
      updatedAt: FieldValue.serverTimestamp()
    });

    const sentTo = process.env.ADMIN_NOTIFICATION_EMAIL || "";
    const senderEmail = process.env.BREVO_SENDER_EMAIL || sentTo;
    const senderName = process.env.BREVO_SENDER_NAME || "Link App";
    const formattedDate = new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Santiago"
    }).format(new Date());

    try {
      if (!hasBrevoConfig()) {
        throw new Error(
          "Falta configuración de Brevo. Define BREVO_API_KEY y ADMIN_NOTIFICATION_EMAIL. BREVO_SENDER_EMAIL es opcional si usarás el mismo correo como remitente."
        );
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY || ""
        },
        body: JSON.stringify({
          sender: {
            email: senderEmail,
            name: senderName
          },
          to: [
            {
              email: sentTo
            }
          ],
          subject: `Nueva postulación: ${application.fullName} - ${application.vacancyTitle}`,
          textContent: buildNotificationText(
            application,
            applicationId,
            formattedDate
          )
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Brevo respondió ${response.status}: ${body}`);
      }

      await registerNotificationLog(applicationId, sentTo, "sent", "");
    } catch (error) {
      logger.error("No se pudo enviar la notificación con Brevo.", error);
      await registerNotificationLog(
        applicationId,
        sentTo,
        "failed",
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }
);

function buildNotificationText(
  application: Application,
  applicationId: string,
  formattedDate: string
) {
  return [
    "Se recibió una nueva postulación.",
    "",
    `Postulante: ${application.fullName}`,
    `Cargo: ${application.vacancyTitle}`,
    `Teléfono: ${application.phone}`,
    `Email: ${application.email}`,
    `Fecha: ${formattedDate}`,
    `ID interno: ${applicationId}`,
    "",
    "Revisa la ficha en el panel administrador."
  ].join("\n");
}

function hasBrevoConfig() {
  return Boolean(
    process.env.BREVO_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL
  );
}

async function registerNotificationLog(
  applicationId: string,
  sentTo: string,
  status: "queued" | "sent" | "failed",
  errorMessage: string
) {
  await db.collection("notifications_log").add({
    applicationId,
    type: "new_application_email",
    sentTo,
    sentAt: Timestamp.now(),
    status,
    errorMessage
  });
}
