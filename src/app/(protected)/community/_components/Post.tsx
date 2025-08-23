"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { LikeSmallIcon } from "./like-small-icon";

interface PostProps {
  id: number;
  author: string;
  content: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  likes: number;
  hasLiked: boolean;
  createdAt?: string; // Optional, if you want to display the creation date
  updatedAt?: string; // Optional, if you want to display the last update date
}

export function Post({
  id,
  author,
  content,
  bookName,
  chapterNumber,
  verseNumber,
  likes,
  hasLiked,
}: PostProps) {
  const [likeCount, setLikeCount] = useState(likes);
  const [hasLikedState, setHasLikedState] = useState(hasLiked);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(true); // 기본값을 true로 설정
  const [isCalculated, setIsCalculated] = useState(false);

  const contentRef = useRef<HTMLParagraphElement>(null);
  const hiddenRef = useRef<HTMLParagraphElement>(null);

  const { mutate: like } = api.post.like.useMutation();

  const onClickLike = async () => {
    if (!hasLikedState) {
      like({ postId: id });
      setLikeCount((prev) => prev + 1);
      setHasLikedState(true);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (hiddenRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(hiddenRef.current).lineHeight,
      );
      const elementHeight = hiddenRef.current.scrollHeight;
      const actualLines = Math.ceil(elementHeight / lineHeight);
      setShouldShowToggle(actualLines > 4);
      setIsCalculated(true);
    }
  }, [content]);

  const displayContent = isExpanded ? content : content;

  return (
    <div className="flex w-full flex-col gap-4 rounded-[20px] bg-[#F5F1EE] px-[20px] py-[25px] shadow-md">
      {/* 숨겨진 측정용 요소 */}
      <p
        ref={hiddenRef}
        className="pointer-events-none invisible absolute text-[15px] font-bold whitespace-pre-wrap"
        style={{ width: "calc(100% - 40px)", top: 0, left: 20 }}
        aria-hidden="true"
      >
        {content}
      </p>

      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-[12px] text-[#4B4B4A]">
            {bookName} {chapterNumber}:{verseNumber}
          </span>
          <span className="text-[12px] text-[#4B4B4A]">{author}</span>
        </div>
        <p
          ref={contentRef}
          className="flex-1 text-[15px] font-bold whitespace-pre-wrap"
          style={{
            // 기본적으로 4줄로 제한하고, 펼침 상태이거나 버튼이 필요없는 경우에만 해제
            display:
              isExpanded || (isCalculated && !shouldShowToggle)
                ? "block"
                : "-webkit-box",
            WebkitLineClamp:
              isExpanded || (isCalculated && !shouldShowToggle) ? "unset" : 4,
            WebkitBoxOrient: "vertical" as const,
            overflow:
              isExpanded || (isCalculated && !shouldShowToggle)
                ? "visible"
                : "hidden",
            opacity: isCalculated ? 1 : 0.8, // 계산 중일 때 약간 흐리게
            transition: "opacity 0.1s ease-in-out",
          }}
        >
          {displayContent}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1"
          disabled={hasLikedState}
          onClick={onClickLike}
        >
          <LikeSmallIcon hasLiked={hasLikedState} />{" "}
          <span className="pt-[2px] text-[14px] font-bold text-[#969492]">
            {likeCount}
          </span>
        </button>

        {/* 펼치기/접기 */}
        {shouldShowToggle && isCalculated && (
          <button onClick={toggleExpanded} className="pt-[4px]">
            <svg
              width="18"
              height="11"
              viewBox="0 0 18 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="M1 1L9 9L17 1"
                stroke="#8CBEDE"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
