import { api, HydrateClient } from "~/trpc/server";
import { Progress } from "./_components/progress";
import Image from "next/image";

export default async function ProgressPage() {
  const groups = await api.group.getGroups();

  /*
   * @ NOTE
   * - 소그룹별 필사 집계. 완료 장수와 목표 장수를 반환한다.
   * - 이 데이터를 이용해 공동체/소그룹별 필사 진행률을 계산한다.
   * - 해당 집계 데이터는 Supabase cron job에서 5분 단위로 업데이트된다.
   */
  const scribeCountByGroup = await api.bible.getScribeCountByGroup();
  const completedBooks = await api.bible.getScribeCompletedBooks();

  const { totalCount, totalGoal } = Object.values(scribeCountByGroup).reduce(
    (acc, { count, total }) => {
      acc.totalCount += count;
      acc.totalGoal += total;
      return acc;
    },
    { totalCount: 0, totalGoal: 0 }
  );

  const totalProgress = totalGoal > 0 ? Math.round((totalCount / totalGoal) * 100) : 0;
  const imageStep = Math.floor(totalProgress / 10) * 10;
  const progressImgSrc = `/book/${imageStep}p.svg`;

  return (
    <HydrateClient>
      <main className="flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
        <div className="container flex flex-col items-center justify-center gap-12">
          <div className="w-full">
            <h2 className="mb-[20px] text-[14px] font-bold">우리의 필사 완성도</h2>

            {/* 공동체 전체 필사 진행률 */}
            <p className="mb-4">
              <span className="text-[24px] font-bold">{completedBooks.length}권</span>{" "}
              <span className="text-[18px] text-gray-600">({totalProgress}%)</span>
            </p>

            {/* 진행도 이미지 (구간 매핑) */}
            <div className="mb-3 flex justify-center">
              <div className="relative w-full max-w-[300px] aspect-[300/212]">
                <Image
                  src={progressImgSrc}
                  alt={`progress ${totalProgress}%`}
                  fill
                  sizes="(max-width: 768px) 80vw, 300px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>

          </div>
          <div className="w-full">
            <h2 className="mb-[20px] text-[14px] font-bold">소그룹별 필사</h2>
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
