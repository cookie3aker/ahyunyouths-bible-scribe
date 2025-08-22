import Link from "next/link";

export async function Header() {
  return (
    <ul className="flex w-full items-center justify-end gap-[20px]">
      <li className="text-[14px] font-bold text-[#FFF8F2]">
        성경 정주행 - 필사편
      </li>
      <li className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#B5D4E8] pt-[1px] text-[14px] font-bold">
        <Link href="/my">MY</Link>
      </li>
      {/* <li className="text-[14px] font-bold">취소</li> */}
    </ul>
  );
}
