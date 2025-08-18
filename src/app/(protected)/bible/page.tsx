import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BibleSelect } from "./_components/bible-select";

export default async function BiblePage({
  searchParams,
}: {
  searchParams?: Promise<{
    group_id?: string;
    book_id?: string;
    chapter_id?: string;
  }>;
}) {
  const groupId = (await searchParams)?.group_id;
  const bookId = (await searchParams)?.book_id;
  const chapterId = (await searchParams)?.chapter_id;
  if (!groupId) {
    notFound();
  }

  const groups = await api.group.getGroups();
  const group = groups.find((g) => g.group_id === Number(groupId));

  void api.bible.getBibleStatistics.prefetch();
  void api.bible.getScribeByGroup.prefetch({
    group_id: Number(groupId),
  });

  return (
    <HydrateClient>
      <main className="flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
        <div className="mb-[28px] flex flex-col gap-2">
          <div className="text-[22px] font-bold">
            {group?.group_name} 소그룹
            <br />
            오늘의 필사도 화이팅!
          </div>

          <div className="text-[15px] font-bold opacity-60">
            필사 할 성경을 선택해줘
          </div>
        </div>

        <BibleSelect groupId={groupId} bookId={bookId} chapterId={chapterId} />
      </main>
    </HydrateClient>
  );
}
