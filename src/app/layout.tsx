import type { Metadata } from "next";
import "./globals.css";

import { APP_NAME } from "@/lib/constants/app";

export const metadata: Metadata = {
  title: `${APP_NAME} | Reclutamiento`,
  description:
    "Aplicación de reclutamiento con publicaciones de vacantes, postulaciones y panel administrativo."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
