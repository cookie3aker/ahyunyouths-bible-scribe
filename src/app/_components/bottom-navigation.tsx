import Link from "next/link";

export function BottomNavigation() {
  return (
    <>
      {/* safe area */}
      <div className="h-[84px] w-full"></div>
      <div className="fixed bottom-0 left-1/2 flex h-[84px] w-full max-w-[768px] -translate-x-1/2">
        <nav className="flex w-full items-center justify-around">
          <Link href="/progress" className="text-blue-500 hover:underline">
            진척도
          </Link>
          <Link href="/" className="text-blue-500 hover:underline">
            홈
          </Link>
          <Link href="/community" className="text-blue-500 hover:underline">
            커뮤니티
          </Link>
        </nav>
      </div>
    </>
  );
}
