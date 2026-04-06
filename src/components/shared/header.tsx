import Link from "next/link";

import { APP_NAME } from "@/lib/constants/app";

export function PublicHeader() {
  return (
    <header className="header-bar">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 0"
        }}
      >
        <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
          {APP_NAME}
        </Link>

        <nav style={{ display: "flex", gap: "0.75rem" }}>
          <Link className="pill" href="/">
            Vacantes activas
          </Link>
        </nav>
      </div>
    </header>
  );
}
