import { api, HydrateClient } from "~/trpc/server";
import { BibleSelect } from "./_components/bible-select";
import { auth } from "~/server/auth";

export default async function BiblePage({
  searchParams,
}: {
  searchParams?: Promise<{
    book_id?: string;
    chapter_id?: string;
  }>;
}) {
  const session = await auth();

  const groupId = session?.user?.groupId?.toString() ?? "";
  const bookId = (await searchParams)?.book_id ?? "";
  const chapterId = (await searchParams)?.chapter_id ?? "";

  const groups = await api.group.getGroups();
  const group = groups.find((g) => g.group_id === Number(groupId));

  return (
    <HydrateClient>
      <main className="min-h-[500px] flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
        <div className="mb-[28px] flex flex-col gap-2">
          <div className="text-[22px] font-bold">
            {group?.group_name} 소그룹
            <br />
            말씀안에서 하나되는 시간
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
