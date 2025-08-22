"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";

export default function MyPage() {
  const { data: session, update: updateSession } = useSession();
  const { data: groups } = api.group.getGroups.useQuery();

  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState(0);
  const [editCount, setEditCount] = useState(0);

  const overLimit = editCount >= 2;

  const { mutateAsync: updateUser } = api.user.update.useMutation();

  useEffect(() => {
    if (session) {
      setName(session.user.name ?? "");
      setGroupId(session.user.groupId ?? 0);
      setEditCount(session.user.editCount ?? 0);
    }
  }, [session]);

  const handleClickSave = async () => {
    await updateUser({ name, groupId });
    await updateSession({
      user: { ...session?.user, name, groupId, editCount: editCount + 1 },
    });
    setEditCount((prev) => prev + 1);
    toast.success("저장 완료!");
  };

  return (
    <main className="flex-grow rounded-t-[24px] bg-[url('/bg-ivory.jpg')] bg-cover bg-center px-[20px] pt-[36px] pb-[130px]">
      <div className="container flex flex-col items-center justify-center gap-[16px]">
        <div className="mb-[10px] w-full">
          <p className="text-[16px] font-bold text-[#302C27]">
            수정사항 저장은 2번까지 가능해
          </p>
        </div>

        <div className="w-full">
          <label className="mb-2 block text-[14px] text-[#302C27]">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[40px] w-full rounded-lg border border-gray-300 p-2 focus:border-[#302C27] focus:outline-none"
          />
        </div>

        <div className="w-full">
          <label className="mb-2 block text-[14px] text-[#302C27]">
            소그룹
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(Number(e.target.value))}
            className="h-[40px] w-full rounded-lg border border-gray-300 p-2 focus:border-[#302C27] focus:outline-none"
          >
            {groups?.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClickSave}
          disabled={!name || !groupId || overLimit}
          className={`h-[44px] w-full rounded-[20px] text-[14px] font-bold ${
            !name || !groupId || overLimit
              ? "bg-[#E5EEF3] text-[#9FBFD1]"
              : "bg-[#8CBEDE] text-[#FFFFFF]"
          }`}
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
