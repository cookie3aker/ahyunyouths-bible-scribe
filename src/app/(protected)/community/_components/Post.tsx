"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

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
    await mutateAsync({ postId: id });
    setLikeCount((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-full max-w-md rounded-lg border p-4 shadow-md">
        <p className="text-gray-700">{content}</p>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onClickLike}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            좋아요 {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}
