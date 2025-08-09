"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { LikeSmallIcon } from "./like-small-icon";
import { LikeBigIcon } from "./like-big-icon";

interface PostProps {
  id: number;
  author: string;
  content: string;
  likes: number;
  createdAt?: string; // Optional, if you want to display the creation date
  updatedAt?: string; // Optional, if you want to display the last update date
}

export function Post({ id, author, content, likes }: PostProps) {
  const [likeCount, setLikeCount] = useState(likes);

  const { mutateAsync } = api.post.like.useMutation();

  const onClickLike = async () => {
    // TODO - 한 사람이 한 게시글에 대해 한 번만 좋아요를 누를 수 있도록 처리
    await mutateAsync({ postId: id });
    setLikeCount((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-[20px] bg-[#F5F1EE] px-[20px] py-[25px] shadow-md">
      <div className="flex w-full items-center justify-between gap-4">
        <p className="flex-1 text-[15px] text-[#302C27]">{content}</p>
        <button onClick={onClickLike} className="self-start">
          {/* TODO - set user's real liked */}
          <LikeBigIcon liked={id % 2 === 0} />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <LikeSmallIcon />{" "}
        <span className="text-[14px] text-[#969492]">{likeCount}</span>
      </div>
    </div>
  );
}
