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
        className="flex scale-64 flex-col items-center justify-center gap-2 text-[16px] font-bold text-[#4faeed]"
      >
        <ChurchIcon />
        <div>모으기</div>
      </Link>
      <Link
        href="/"
        aria-label="채우기"
        className="flex scale-64 flex-col items-center justify-center gap-2 text-[16px] font-bold text-[#4faeed]"
      >
        <BookIcon />
        <div>채우기</div>
      </Link>
      <Link
        href="/community"
        aria-label="나누기"
        className="flex scale-64 flex-col items-center justify-center gap-2 text-[16px] font-bold text-[#4faeed]"
      >
        <HeartIcon />
        <div>나누기</div>
      </Link>
    </nav>
  );
}
