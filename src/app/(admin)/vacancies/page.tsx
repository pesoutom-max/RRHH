import { AdminShell } from "@/components/admin/admin-shell";
import { VacanciesManager } from "@/components/admin/vacancies-manager";

export default function VacanciesPage() {
  return (
    <AdminShell title="Vacantes">
      <VacanciesManager />
    </AdminShell>
  );
}

