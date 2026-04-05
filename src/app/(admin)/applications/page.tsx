import { AdminShell } from "@/components/admin/admin-shell";
import { ApplicationsBoard } from "@/components/admin/applications-board";

export default function ApplicationsPage() {
  return (
    <AdminShell title="Postulaciones">
      <ApplicationsBoard />
    </AdminShell>
  );
}

