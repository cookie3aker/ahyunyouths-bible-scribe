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

  return (
    <HydrateClient>
      <div className="fixed inset-0 bg-[url('/bg-ivory.png')] bg-cover bg-center opacity-100"></div>

      <div className="relative px-[32px] py-[20px]">
        <div className="mb-[28px] flex flex-col gap-2">
          <div className="text-[22px]">
            {group?.group_name} 소그룹
            <br />
            오늘의 필사 화이팅!
          </div>

          <div className="text-[16px] text-[#302C27] opacity-60">
            필사 할 성경을 선택해줘
          </div>
        </div>

        <BibleSelect groupId={groupId} bookId={bookId} chapterId={chapterId} />
      </div>
    </HydrateClient>
  );
}
