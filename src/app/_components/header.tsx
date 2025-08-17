export async function Header() {
  return (
    <header className="relative z-10 mt-[60px] w-full px-[22px]">
      <ul className="flex w-full items-center justify-end gap-[20px]">
        <li className="text-[14px] font-bold text-[#FFF8F2]">
          아현젊은이교회 성경 필사
        </li>
        <li className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#B5D4E8] text-[14px] font-bold">
          MY
        </li>
        <li className="text-[14px] font-bold">취소</li>
      </ul>
    </header>
  );
}
