import { api, HydrateClient } from "~/trpc/server";
import { Progress } from "./_components/progress";

export default async function ProgressPage() {
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="fixed inset-0 bg-[url('/bg-ivory.png')] bg-cover bg-center opacity-100"></div>

      <div className="relative container flex flex-col items-center justify-center gap-12">
        <div className="mt-[36px] w-full px-[42px]">
          <h2 className="mb-[8px] text-[14px] text-[#736F6A]">
            우리의 필사 완성도
          </h2>
          <div className="text-[22px] text-[#302C27]">새싹 Lv.2</div>
        </div>

        <div className="w-full px-[42px]">
          <h2 className="mb-[24px]">소그룹별 필사</h2>
          <div className="flex w-full flex-col gap-4">
            {groups.map((group, index) => (
              <Progress
                key={group.group_id}
                index={index}
                groupName={group.group_name}
                progress={index * 10} // 예시로 10%씩 증가
              />
            ))}
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
