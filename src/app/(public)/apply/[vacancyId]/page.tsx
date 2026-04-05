import { PublicHeader } from "@/components/shared/header";
import { ApplicationFlow } from "@/components/public/application-flow";

export default async function ApplyPage({
  params
}: {
  params: Promise<{ vacancyId: string }>;
}) {
  const { vacancyId } = await params;

  return (
    <>
      <PublicHeader />
      <ApplicationFlow vacancyId={vacancyId} />
    </>
  );
}

