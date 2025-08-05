import { api, HydrateClient } from "~/trpc/server";

export default async function Test() {
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Bible Books
        </h1>
        <ul className="list-disc">
          {groups.map((it) => (
            <li key={it.group_id} className="text-lg">
              {it.group_name}
            </li>
          ))}
        </ul>
      </div>
    </HydrateClient>
  );
}