"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface SelectGroupProps {
  groups: { group_id: number; group_name: string }[];
}

export function SelectGroup({ groups }: SelectGroupProps) {
  const router = useRouter();

  const { mutateAsync: updateUser } = api.user.update.useMutation();

  const handleClickGroup = async (groupId: number) => {
    try {
      await updateUser({ groupId });
      router.push(`/bible?group_id=${groupId}`);
    } catch (error) {
      console.error(error);
      alert("에러가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {groups.map((it) => (
        <button
          key={it.group_id}
          className="h-[50px] w-[96px] cursor-pointer rounded-[50px] bg-white/30 p-4 text-center text-[14px] text-white hover:bg-[#CFE3EF] hover:text-black"
          onClick={() => handleClickGroup(it.group_id)}
        >
          {it.group_name}
        </button>
      ))}
    </div>
  );
}
