import { z } from "zod";

import { isValidRut } from "./rut";

export const applicationSchema = z.object({
  fullName: z.string().min(5, "Ingresa tu nombre completo."),
  rut: z.string().refine(isValidRut, "Ingresa un RUT válido."),
  phone: z
    .string()
    .min(8, "Ingresa un teléfono válido.")
    .regex(/^[0-9+()\s-]+$/, "El teléfono contiene caracteres no válidos."),
  email: z.string().email("Ingresa un correo válido."),
  comuna: z.string().min(2, "Ingresa tu comuna."),
  age: z.coerce
    .number({ invalid_type_error: "Ingresa tu edad." })
    .int("La edad debe ser un número entero.")
    .min(18, "Debes ser mayor de 18 años.")
    .max(80, "La edad parece incorrecta."),
  address: z.string().min(5, "Ingresa tu dirección."),
  experienceSummary: z
    .string()
    .min(20, "Cuéntanos brevemente tu experiencia."),
  lastJob: z.string().min(3, "Indica tu último trabajo."),
  availability: z.string().min(2, "Indica tu disponibilidad."),
  canWorkWeekends: z.boolean(),
  canStartImmediately: z.boolean(),
  hasCustomerServiceExperience: z.boolean(),
  hasFoodHandlingExperience: z.boolean(),
  transportToWork: z.string().min(3, "Indica cómo llegarías al trabajo."),
  expectedSalary: z.string().min(2, "Indica tu pretensión de renta."),
  motivation: z.string().min(20, "Cuéntanos por qué te interesa el cargo."),
  strengths: z.string().min(10, "Indica al menos una fortaleza."),
  weaknesses: z.string().min(10, "Indica al menos una debilidad."),
  canWorkSaturdays: z.boolean(),
  canWorkSundaysOrHolidays: z.boolean(),
  canCommuteIndependently: z.boolean(),
  availableFrom: z.string().min(2, "Indica desde cuándo podrías comenzar."),
  interestReason: z.string().min(20, "Explica por qué te interesa el cargo."),
  mainStrength: z
    .string()
    .min(10, "Indica tu principal fortaleza para este trabajo."),
  consentAccepted: z
    .boolean()
    .refine((value) => value, "Debes aceptar el tratamiento de datos para enviar.")
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
