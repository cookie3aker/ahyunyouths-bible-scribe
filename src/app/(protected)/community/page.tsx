"use client";

import Link from "next/link";
import { LoaderIcon } from "lucide-react";

import { Post } from "./_components/Post";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { api } from "~/trpc/react";

export default function CommunityPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.post.getPostsInfinite.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      },
    );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages?.flatMap((page) => page?.posts ?? []) ?? [];

  console.log(posts);

  return (
    <main className="flex-grow px-[20px] pt-[36px] pb-[130px]">
      <div className="container flex flex-col items-center justify-center">
        <div className="mb-[10px] w-full">
          <p className="text-[22px] font-bold text-[#302C27]">
            필사를 하며 느낀
            <br />
            은혜를 나눠줘!
          </p>
        </div>

        <div className="mb-[18px] flex w-full justify-end">
          <Link
            href="/community/write"
            className="flex h-[38px] w-full max-w-[85px] cursor-pointer items-center justify-center rounded-[50px] bg-[#CFE3EF] p-2 text-[14px] text-[#63A3CB]"
          >
            글쓰기
          </Link>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-4">
          {posts.map((it) => (
            <Post
              key={it.id}
              id={it.id}
              author={it.createdBy.name ?? ""}
              content={it.content}
              bookName={it.book.book_name}
              chapterNumber={it.chapter.chapter_number}
              verseNumber={it.verse.verse_number}
              likes={it.likes}
              hasLiked={it.hasLiked}
            />
          ))}
          {posts.length > 0 && <div ref={ref} style={{ height: 32 }} />}
          {isFetchingNextPage && (
            <div>
              <LoaderIcon className="animate-spin text-gray-200" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
