import { api, HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { SelectGroup } from "./_components/select-group";
import { LoginModal } from "./_components/login-modal";

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

          <SelectGroup groups={groups} />
        </div>
      </div>

      {!session && <LoginModal />}
    </HydrateClient>
  );
}
