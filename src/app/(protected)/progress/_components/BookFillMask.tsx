"use client";
import Image from "next/image";
import baseImg from "@/public/book-base.png";
import fullImg from "@/public/book-full.png";

type Props = {
  progress: number; // 0~100
  width?: number;   // px
  direction?: "bottom-up" | "left-right";
};

export default function BookFillMask({
  progress,
  width = 200,
  direction = "bottom-up",
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  const sizeStyle =
    direction === "bottom-up"
      ? { height: `${pct}%`, width: "100%" }
      : { width: `${pct}%`, height: "100%" };

  return (
    <div
      className="relative"
      style={{ width, aspectRatio: `${baseImg.width} / ${baseImg.height}` }}
    >
      {/* 0% 베이스 */}
      <Image
        src={baseImg}
        alt="book base"
        fill
        sizes={`${width}px`}
        style={{ objectFit: "contain" }}
        priority
      />

      {/* 채움 레이어 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 bottom-0 transition-[height,width] duration-300 ease-out"
          style={{
            ...sizeStyle,
            // 베이스 이미지의 알파를 마스크로 사용
            WebkitMaskImage: `url(${baseImg.src})`,
            maskImage: `url(${baseImg.src})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            // 채움 소스 = 100% 이미지
            backgroundImage: `url(${fullImg.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition:
              direction === "bottom-up" ? "center bottom" : "left center",
          }}
        />
      </div>
    </div>
  );
}