import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Typing } from "./_components/typing";
import { XIcon } from "~/app/_components/icons/x-icon";
import Link from "next/link";
import { auth } from "~/server/auth";

export default async function ScribePage({
  searchParams,
}: {
  searchParams?: Promise<{
    book_id?: string;
    chapter_id?: string;
    verse_id?: string;
  }>;
}) {
  const session = await auth();

  const userId = session?.user.id;
  const groupId = session?.user.groupId;
  const bookId = (await searchParams)?.book_id;
  const chapterId = (await searchParams)?.chapter_id;
  const verseId = (await searchParams)?.verse_id;
  if (!userId || !groupId || !groupId || !bookId || !chapterId || !verseId) {
    notFound();
  }

  const verse = await api.bible.getVerse({
    book_id: Number(bookId),
    chapter_id: Number(chapterId),
    verse_id: Number(verseId),
  });

  return (
    <HydrateClient>
      <main className="flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
        <div className="fixed inset-0 bg-[url('/bg-ivory.png')] bg-cover bg-center opacity-100"></div>

        <div className="relative px-[20px] pt-[108px]">
          <div className="flex w-full justify-end px-[20px]">
            <Link
              href={`/bible?group_id=${groupId}&book_id=${bookId}&chapter_id=${chapterId}`}
            >
              <XIcon />
            </Link>
          </div>

          <div className="mb-[42px] text-[22px] text-[#302C27]">
            {verse?.book?.book_name} {verse?.chapter.chapter_number}:
            {verse?.verse.verse_number}
          </div>

          <Typing
            targetText={verse?.verse.verse_text ?? ""}
            userId={userId}
            groupId={groupId}
            bookId={Number(bookId)}
            chapterId={Number(chapterId)}
            verseId={Number(verseId)}
          />
        </div>
      </main>
    </HydrateClient>
  );
}
