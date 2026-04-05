import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardContent } from "@/components/admin/dashboard-content";

export default function DashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <DashboardContent />
    </AdminShell>
  );
}

