import { api, HydrateClient } from "~/trpc/server";

export default async function Test() {
  const books = await api.bible.getBooks();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Bible Books
        </h1>
        <ul className="list-disc">
          {books.map((book) => (
            <li key={book.book_id} className="text-lg">
              {book.book_name}
            </li>
          ))}
        </ul>
      </div>
    </HydrateClient>
  );
}