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
}: PostProps) {
  const [likeCount, setLikeCount] = useState(likes);

  const { mutateAsync } = api.post.like.useMutation();

  const onClickLike = async () => {
    // TODO - 한 사람이 한 게시글에 대해 한 번만 좋아요를 누를 수 있도록 처리
    // 현재 유저가 해당 게시글에 대해 좋아요를 누른 적이 있는지 체크

    await mutateAsync({ postId: id });
    setLikeCount((prev) => prev + 1);
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
        <p className="flex-1 text-[15px] font-bold">{content}</p>
      </div>
      <div className="flex items-center gap-1">
        <LikeSmallIcon />{" "}
        <span className="text-[14px] text-[#969492]">{likeCount}</span>
      </div>
    </div>
  );
}
