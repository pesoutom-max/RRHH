"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInAdmin } from "@/lib/firebase/firestore-services";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
          await signInAdmin(email, password);
          router.replace("/dashboard");
        } catch (nextError) {
          setError("Credenciales inválidas o usuario sin acceso al panel.");
        } finally {
          setSubmitting(false);
        }
      }}
      style={{ padding: "2rem", maxWidth: 460, margin: "0 auto" }}
    >
      <h1>Ingreso administrador</h1>
      <p className="muted">
        Solo usuarios registrados en Firebase Authentication y `admin_users`
        pueden entrar al panel.
      </p>
      <div className="grid">
        <div className="field">
          <label>Correo</label>
          <input
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </div>
        {error ? <div className="field-error">{error}</div> : null}
        <button className="btn btn-primary" disabled={submitting} type="submit">
          {submitting ? "Ingresando..." : "Entrar al panel"}
        </button>
      </div>
    </form>
  );
}

