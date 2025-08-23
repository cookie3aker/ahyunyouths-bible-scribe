"use client";

import { useEffect, useState } from "react";
import { colorSet } from "../_constants";

interface ProgressProps {
  index: number;
  groupName: string;
  progress: number;
}

export function Progress({ index, groupName, progress }: ProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

  const selectedColor = colorSet[index % colorSet.length]!;

  useEffect(() => {
    // 첫 렌더링 후 실제 progress 값으로 변경
    requestAnimationFrame(() => {
      setCurrentProgress(Math.min(progress, 100));
    });
  }, [progress]);

  return (
    <div className="flex w-full gap-2">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-[39px] w-[39px] rounded-full"
          style={{
            backgroundColor: selectedColor.background,
          }}
        ></div>
        <div className="text-[12px] font-bold text-nowrap">
          <div>{groupName}</div>
        </div>
      </div>
      <div
        className="h-[39px] w-full overflow-hidden rounded-[10px]"
        style={{
          backgroundColor: selectedColor.background,
        }}
      >
        <div
          className="h-[39px] w-full rounded-[10px] transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${currentProgress - 100}%)`,
            backgroundColor: selectedColor.foreground,
          }}
        ></div>
      </div>
    </div>
  );
}
