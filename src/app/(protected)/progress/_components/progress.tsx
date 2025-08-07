interface ProgressProps {
  groupName: string;
  progress: number;
}

export function Progress({ groupName, progress }: ProgressProps) {
  const clampedProgress = Math.min(progress, 100);

  return (
    <div className="flex w-full gap-4 rounded p-4">
      <h2 className="mb-2 text-lg font-semibold text-nowrap">
        {groupName} 소그룹
      </h2>
      <div className="mb-2 h-4 w-full rounded-full bg-gray-200">
        <div
          className="h-4 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
