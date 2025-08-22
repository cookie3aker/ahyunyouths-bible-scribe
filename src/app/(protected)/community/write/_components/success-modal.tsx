"use client";

import { useRouter } from "next/navigation";

export function SuccessModal() {
  const router = useRouter();

  const handleClickComplete = () => {
    router.push("/community");
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-[768px] rounded-[20px] bg-white">
        <div className="flex h-[190px] flex-col items-center justify-center">
          <h2 className="mb-[8px] text-[20px] font-bold">은혜 나눔 성공!</h2>

          <p className="mb-[40px] text-[14px] text-[#A1A1A1]">
            나눠줘서 고마워
          </p>
          <button
            onClick={handleClickComplete}
            className="h-[44px] w-full max-w-[226px] rounded-[20px] bg-[#91CDF4] text-[14px] font-bold text-[#FFFFFF]"
          >
            나눔 보러가기
          </button>
        </div>
      </div>
    </div>
  );
}
