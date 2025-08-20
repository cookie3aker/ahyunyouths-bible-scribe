"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { LikeSmallIcon } from "./like-small-icon";
import { LikeBigIcon } from "./like-big-icon";

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

  const { mutate: like } = api.post.like.useMutation();

  const onClickLike = async () => {
    if (!hasLikedState) {
      like({ postId: id });
      setLikeCount((prev) => prev + 1);
      setHasLikedState(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-[20px] bg-[#F5F1EE] px-[20px] py-[25px] shadow-md">
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-[12px] text-[#4B4B4A]">
            {bookName} {chapterNumber}:{verseNumber}
          </span>
          <span className="text-[12px] text-[#4B4B4A]">{author}</span>
        </div>
        <p className="flex-1 text-[15px] font-bold whitespace-pre-wrap">
          {content}
        </p>
      </div>
      <div>
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
      </div>
    </div>
  );
}
