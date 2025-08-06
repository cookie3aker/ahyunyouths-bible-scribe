import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BibleSelect } from "./_components/bible-select";

export default async function BiblePage({
  searchParams,
}: {
  searchParams?: Promise<{ group_id?: string }>;
}) {
  const groupId = (await searchParams)?.group_id;
  if (!groupId) {
    notFound();
  }

  const groups = await api.group.getGroups();
  const group = groups.find((g) => g.group_id === Number(groupId));

  void api.bible.getBibleStatistics.prefetch();

  return (
    <HydrateClient>
      <div>
        {group?.group_name}소그룹
        <br />
        오늘의 필사도 화이팅!
      </div>

      <div>필사 할 성경을 선택해줘</div>

      <BibleSelect />
    </HydrateClient>
  );
}
