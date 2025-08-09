interface LikeBigIconProps {
  liked: boolean;
}

export function LikeBigIcon({ liked }: LikeBigIconProps) {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5645 0C21.0918 0 23.9519 2.8594 23.9521 6.38672C23.9521 6.83427 23.904 7.27079 23.8164 7.69238C22.51 17.6602 15.1199 23.3465 11.9756 24.75C3.76379 20.8857 0 11.5762 0 6.38672C0.000204079 2.85961 2.85964 0.000340362 6.38672 0C8.79214 0 10.8863 1.33047 11.9756 3.29492C13.0648 1.33039 15.159 0.000129875 17.5645 0Z"
        fill={liked ? "#F99E9E" : "#CAC9C9"}
      />
    </svg>
  );
}
