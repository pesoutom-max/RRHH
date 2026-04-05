import { AdminShell } from "@/components/admin/admin-shell";
import { ApplicationDetail } from "@/components/admin/application-detail";

export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  return (
    <AdminShell title="Detalle de postulación">
      <ApplicationDetail applicationId={applicationId} />
    </AdminShell>
  );
}

