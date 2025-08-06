import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12">
        <div>
          필사를 통해
          <br />
          하나님과 더욱 가까워지는 시간
        </div>
        <div>너의 소그룹을 선택해줘!</div>
        <div className="grid grid-cols-3 gap-4">
          {groups.map((it) => (
            <a
              key={it.group_id}
              className="cursor-pointer rounded border p-4 text-center text-lg"
              href={`/scribe?group_id=${it.group_id}`}
            >
              {it.group_name}
            </a>
          ))}
        </div>
      </div>
    </HydrateClient>
  );
}
