import { api, HydrateClient } from "~/trpc/server";
import { SetProfileModal } from "../_components/set-profile-modal";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="relative container flex flex-col items-center justify-center gap-12">
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
              href={`/bible?group_id=${it.group_id}`}
            >
              {it.group_name}
            </a>
          ))}
        </div>

        {!session?.user.groupId && (
          <SetProfileModal
            name={session?.user.name ?? ""}
            email={session?.user.email ?? ""}
          />
        )}
      </div>
    </HydrateClient>
  );
}
