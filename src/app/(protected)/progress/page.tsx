import { api, HydrateClient } from "~/trpc/server";
import { Progress } from "./_components/progress";

export default async function ProgressPage() {
  const groups = await api.group.getGroups();

  /**
   * @ NOTE
   * - 소그룹별 필사 집계. 완료 장수와 목표 장수를 반환한다.
   * - 이 데이터를 이용해 공동체/소그룹별 필사 진행률을 계산한다.
   * - 해당 집계 데이터는 Supabase cron job에서 5분 단위로 업데이트된다.
   */
  const scribeCountByGroup = await api.bible.getScribeCountByGroup();

  return (
    <HydrateClient>
      <main className="flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
        <div className="container flex flex-col items-center justify-center gap-12">
          <div className="w-full">
            <h2 className="mb-[8px] text-[14px] text-[#736F6A]">
              우리의 필사 완성도
            </h2>
            <div className="text-[22px] text-[#302C27]">새싹 Lv.2</div>
          </div>

          <div className="w-full">
            <h2 className="mb-[24px]">소그룹별 필사</h2>
            <div className="flex w-full flex-col gap-4">
              {groups.map((group, index) => (
                <Progress
                  key={group.group_id}
                  index={index}
                  groupName={group.group_name}
                  progress={
                    ((scribeCountByGroup[group.group_id]?.count ?? 0) /
                      (scribeCountByGroup[group.group_id]?.total ?? 1)) *
                    100
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
