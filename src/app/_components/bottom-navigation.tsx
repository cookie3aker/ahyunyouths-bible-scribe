import Link from "next/link";
import { ChurchIcon } from "./icons/church-icon";
import { BookIcon } from "./icons/book-icon";
import { HeartIcon } from "./icons/heart-icon";

export function BottomNavigation() {
  return (
    <nav className="flex w-full items-center justify-around">
      <Link
        href="/progress"
        aria-label="모으기"
        className="flex scale-60 flex-col items-center justify-center gap-2 text-[14px] font-bold text-[#302C27]"
      >
        <ChurchIcon />
        <div>모으기</div>
      </Link>
      <Link
        href="/"
        aria-label="채우기"
        className="flex scale-60 flex-col items-center justify-center gap-2 text-[14px] font-bold text-[#302C27]"
      >
        <BookIcon />
        <div>채우기</div>
      </Link>
      <Link
        href="/community"
        aria-label="나누기"
        className="flex scale-60 flex-col items-center justify-center gap-2 text-[14px] font-bold text-[#302C27]"
      >
        <HeartIcon />
        <div>나누기</div>
      </Link>
    </nav>
  );
}
