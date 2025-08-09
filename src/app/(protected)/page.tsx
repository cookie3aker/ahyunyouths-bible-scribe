import { api, HydrateClient } from "~/trpc/server";
import { SetProfileModal } from "../_components/set-profile-modal";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="px-[38px] pt-[110px]">
        <div className="fixed inset-0 bg-[#302C27]"></div>
        <div className="fixed inset-0 bg-[url('/main-bg.png')] bg-cover bg-center opacity-100"></div>

        <div className="relative container flex flex-col items-center justify-center gap-12">
          <div className="flex w-full flex-col gap-2">
            <div className="w-full text-[22px] text-white">
              필사를 통해
              <br />
              하나님과 더욱 가까워지는 시간
            </div>
            <div className="text-[16px] text-[#D9D9D9]">
              너의 소그룹을 선택해줘!
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {groups.map((it) => (
              <a
                key={it.group_id}
                className="h-[50px] w-[96px] cursor-pointer rounded-[50px] bg-white/30 p-4 text-center text-[14px] text-white hover:bg-white/100 hover:text-black"
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
      </div>
    </HydrateClient>
  );
}
