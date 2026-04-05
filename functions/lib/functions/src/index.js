"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onApplicationCreated = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const scoring_1 = require("../../shared/scoring");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
exports.onApplicationCreated = (0, firestore_2.onDocumentCreated)("applications/{applicationId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.error("Evento recibido sin snapshot de aplicación.");
        return;
    }
    const applicationId = event.params.applicationId;
    const application = snapshot.data();
    const score = (0, scoring_1.calculateApplicationScore)(application);
    await snapshot.ref.update({
        score,
        updatedAt: firestore_1.FieldValue.serverTimestamp()
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
            throw new Error("Falta configuración de Brevo. Define BREVO_API_KEY y ADMIN_NOTIFICATION_EMAIL. BREVO_SENDER_EMAIL es opcional si usarás el mismo correo como remitente.");
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
                textContent: buildNotificationText(application, applicationId, formattedDate)
            })
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Brevo respondió ${response.status}: ${body}`);
        }
        await registerNotificationLog(applicationId, sentTo, "sent", "");
    }
    catch (error) {
        logger.error("No se pudo enviar la notificación con Brevo.", error);
        await registerNotificationLog(applicationId, sentTo, "failed", error instanceof Error ? error.message : "Error desconocido");
    }
});
function buildNotificationText(application, applicationId, formattedDate) {
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
    return Boolean(process.env.BREVO_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL);
}
async function registerNotificationLog(applicationId, sentTo, status, errorMessage) {
    await db.collection("notifications_log").add({
        applicationId,
        type: "new_application_email",
        sentTo,
        sentAt: firestore_1.Timestamp.now(),
        status,
        errorMessage
    });
}
//# sourceMappingURL=index.js.map