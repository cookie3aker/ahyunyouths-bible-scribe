import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";

export default async function ScribePage({
  searchParams,
}: {
  searchParams?: { group_id?: string };
}) {
  const groupId = searchParams?.group_id;
  if (!groupId) {
    notFound();
  }

  const groups = await api.group.getGroups();
  const group = groups.find((g) => g.group_id === Number(groupId));

  const books = await api.bible.getBooks();

  return (
    <HydrateClient>
      <div>
        {group?.group_name}소그룹
        <br />
        오늘의 필사도 화이팅!
      </div>
      <div>필사 할 성경을 선택해줘</div>

      <select className="mb-4">
        {books.map((book) => (
          <option key={book.book_id} value={book.book_id}>
            {book.book_name}
          </option>
        ))}
      </select>
    </HydrateClient>
  );
}
