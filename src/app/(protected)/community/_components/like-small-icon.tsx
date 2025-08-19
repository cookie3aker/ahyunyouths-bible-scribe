interface LikeSmallIconProps {
  hasLiked: boolean;
}

export function LikeSmallIcon({ hasLiked }: LikeSmallIconProps) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.22559 0C11.0782 0 12.5808 1.50189 12.5811 3.35449C12.5811 3.60022 12.5531 3.83959 12.5029 4.07031C11.8058 9.28723 7.93839 12.2642 6.29004 13C1.9768 10.9703 0 6.08025 0 3.35449C0.000244994 1.502 1.50198 0.000173536 3.35449 0C4.61784 0 5.71783 0.698771 6.29004 1.73047C6.86216 0.698712 7.96225 0.000103408 9.22559 0Z"
        fill={hasLiked ? "#FFADAD" : "#969492"}
      />
    </svg>
  );
}
