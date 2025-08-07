import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export async function Header() {
  const session = await auth();
  const groups = await api.group.getGroups();
  const myGroupName = session?.user.groupId
    ? groups.find((g) => g.group_id === session.user.groupId)?.group_name
    : "";

  return (
    <header className="bg-blue-500 p-4 text-white">
      <div>
        {myGroupName} 소그룹 | {session?.user.name}
      </div>
    </header>
  );
}
