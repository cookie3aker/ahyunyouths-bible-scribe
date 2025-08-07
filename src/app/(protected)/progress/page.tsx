import { api, HydrateClient } from "~/trpc/server";
import { Progress } from "./_components/progress";

export default async function ProgressPage() {
  const groups = await api.group.getGroups();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12">
        <div>
          <h2>우리의 필사 완성도</h2>
          <div>icon</div>
        </div>

        <div className="w-full">
          <h2>소그룹별 필사 완성도</h2>
          {groups.map((group, index) => (
            <Progress
              key={group.group_id}
              groupName={group.group_name}
              progress={index * 10} // 예시로 10%씩 증가
            />
          ))}
        </div>
      </div>
    </HydrateClient>
  );
}
