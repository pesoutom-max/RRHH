"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { signOutAdmin } from "@/lib/firebase/firestore-services";
import { useAdminSession } from "@/hooks/use-admin-session";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Postulaciones" },
  { href: "/vacancies", label: "Vacantes" }
] as const;

export function AdminShell({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, profile, isAdmin } = useAdminSession();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/login");
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="container section">
        <div className="card" style={{ padding: "2rem" }}>
          Validando acceso al panel...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="grid">
          <div>
            <strong style={{ fontSize: "1.2rem" }}>Panel administrador</strong>
            <p className="muted">
              {profile?.name} · {profile?.role}
            </p>
          </div>

          <nav className="grid">
            {links.map((link) => (
              <Link
                key={link.href}
                className={cn("pill", pathname === link.href && "btn-secondary")}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="btn btn-ghost"
            onClick={async () => {
              await signOutAdmin();
              router.replace("/login");
            }}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ marginBottom: 6 }}>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
