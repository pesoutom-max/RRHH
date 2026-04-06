import Link from "next/link";

import { APP_NAME } from "@/lib/constants/app";

export function PublicHeader() {
  return (
    <header className="header-bar">
      <div className="container public-header-inner">
        <Link className="public-header-brand" href="/">
          {APP_NAME}
        </Link>

        <nav className="public-header-nav">
          <Link className="pill" href="/">
            Vacantes activas
          </Link>
        </nav>
      </div>
    </header>
  );
}
