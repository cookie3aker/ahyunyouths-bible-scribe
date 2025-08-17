import { api, HydrateClient } from "~/trpc/server";
import { SetProfileModal } from "../_components/set-profile-modal";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user.groupId) {
    redirect(`/bible?group_id=${session.user.groupId}`);
  }

  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="fixed inset-0 z-9999 px-[38px] pt-[110px]">
        <div className="fixed inset-0 bg-[#747170]"></div>
        <div className="fixed inset-0 bg-[url('/bg-main.png')] bg-cover bg-center opacity-100"></div>

        <div className="relative container flex flex-col items-center justify-center gap-12">
          <div className="flex w-full flex-col gap-2">
            <div className="w-full text-[22px] text-white">
              너의 소그룹을 선택해줘
            </div>
            <div className="text-[16px] text-[#D9D9D9]">
              소그룹 수정은 마이페이지에서 가능해
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {groups.map((it) => (
              <a
                key={it.group_id}
                className="h-[50px] w-[96px] cursor-pointer rounded-[50px] bg-white/30 p-4 text-center text-[14px] text-white hover:bg-[#CFE3EF] hover:text-black"
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
