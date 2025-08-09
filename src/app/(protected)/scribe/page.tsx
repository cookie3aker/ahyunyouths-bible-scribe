import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Typing } from "./_components/typing";
import { XIcon } from "~/app/_components/icons/x-icon";
import Link from "next/link";

export default async function ScribePage({
  searchParams,
}: {
  searchParams?: Promise<{
    group_id?: string;
    book_id?: string;
    chapter_id?: string;
    verse_number?: string;
  }>;
}) {
  const groupId = (await searchParams)?.group_id;
  const bookId = (await searchParams)?.book_id;
  const chapterId = (await searchParams)?.chapter_id;
  const verseNumber = (await searchParams)?.verse_number;
  if (!groupId || !bookId || !chapterId || !verseNumber) {
    notFound();
  }

  const verse = await api.bible.getVerse({
    book_id: Number(bookId),
    chapter_id: Number(chapterId),
    verse_number: Number(verseNumber),
  });

  return (
    <HydrateClient>
      <div className="fixed inset-0 -z-10 bg-[url('/bg-ivory.png')] bg-cover bg-center opacity-100"></div>

      <div className="relative px-[20px] pt-[108px]">
        <div className="flex w-full justify-end px-[20px]">
          <Link href={`/bible?group_id=${groupId}`}>
            <XIcon />
          </Link>
        </div>

        <div className="mb-[42px] text-[22px] text-[#302C27]">
          {verse?.book?.book_name} {verse?.chapter.chapter_number}:
          {verse?.verse.verse_number}
        </div>

        <Typing targetText={verse?.verse.verse_text ?? ""} />
      </div>
    </HydrateClient>
  );
}
