import { PublicHeader } from "@/components/shared/header";
import { VacancyDetail } from "@/components/public/vacancy-detail";

export default async function VacancyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <PublicHeader />
      <VacancyDetail slug={slug} />
    </>
  );
}

