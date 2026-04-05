import { z } from "zod";

export const vacancySchema = z.object({
  title: z.string().min(5, "Ingresa el título del cargo."),
  description: z.string().min(30, "Describe el cargo con más detalle."),
  responsibilitiesText: z
    .string()
    .min(10, "Ingresa al menos una función del cargo."),
  requirementsText: z
    .string()
    .min(10, "Ingresa al menos un requisito del cargo."),
  schedule: z.string().min(3, "Ingresa el horario."),
  location: z.string().min(3, "Ingresa la ubicación."),
  salary: z.string().min(2, "Ingresa la renta o rango."),
  status: z.enum(["active", "inactive", "closed"])
});

export type VacancyFormValues = z.infer<typeof vacancySchema>;

