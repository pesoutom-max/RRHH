import Link from "next/link";

import { PublicHeader } from "@/components/shared/header";

export default function ApplicationSuccessPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell">
        <section className="section">
          <div className="container">
            <article className="card" style={{ padding: "2rem", maxWidth: 760 }}>
              <span className="pill">Postulación recibida</span>
              <h1>Tu información fue enviada correctamente.</h1>
              <p className="muted">
                Hemos registrado tu postulación y el equipo encargado podrá revisarla
                con toda la información que compartiste.
              </p>
              <Link className="btn btn-primary" href="/">
                Volver al inicio
              </Link>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

