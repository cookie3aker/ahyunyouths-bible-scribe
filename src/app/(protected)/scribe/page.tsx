import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Typing } from "./_components/typing";

export default async function ScribePage({
  searchParams,
}: {
  searchParams?: Promise<{
    book_id?: string;
    chapter_id?: string;
    verse_number?: string;
  }>;
}) {
  const bookId = (await searchParams)?.book_id;
  const chapterId = (await searchParams)?.chapter_id;
  const verseNumber = (await searchParams)?.verse_number;
  if (!bookId || !chapterId || !verseNumber) {
    notFound();
  }

  const verse = await api.bible.getVerse({
    book_id: Number(bookId),
    chapter_id: Number(chapterId),
    verse_number: Number(verseNumber),
  });

  return (
    <HydrateClient>
      필사할 성경
      <br />
      <div>
        {verse?.book?.book_name} {verse?.chapter.chapter_number}장{" "}
        {verse?.verse.verse_number}절
      </div>
      <Typing targetText={verse?.verse.verse_text ?? ""} />
    </HydrateClient>
  );
}
