interface ProgressProps {
  index: number;
  groupName: string;
  progress: number;
}

export function Progress({ index, groupName, progress }: ProgressProps) {
  const clampedProgress = Math.min(progress, 100);

  const colorSet = [
    {
      background: "#FBE1CC",
      foreground: "#F9B279",
    },
    {
      background: "#D9EDD9",
      foreground: "#91D990",
    },
    {
      background: "#D7EDF1",
      foreground: "#B2DCE3",
    },
  ];

  return (
    <div className="flex w-full gap-2">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-[39px] w-[39px] rounded-full"
          style={{ backgroundColor: colorSet[index % 3]!.background }}
        ></div>
        <div className="text-[13px] text-nowrap">
          <div>{groupName}</div>
        </div>
      </div>
      <div
        className="h-[39px] w-full rounded-full"
        style={{ backgroundColor: colorSet[index % 3]!.background }}
      >
        <div
          className="h-[39px] rounded-full transition-all duration-300"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: colorSet[index % 3]!.foreground,
          }}
        ></div>
      </div>
    </div>
  );
}
