import { redirect } from "next/navigation";

export default function MissionIndexPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/missions/${params.id}/grunddaten`);
}
