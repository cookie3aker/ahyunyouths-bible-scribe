import Link from "next/link";
import { Post } from "./_components/Post";
import { api } from "~/trpc/server";

export default async function CommunityPage() {
  const posts = await api.post.getAllPosts();

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
              author={""}
              content={it.content}
              likes={it.likes}
              // createdAt={it.createdAt.toISOString()}
              // updatedAt={it.updatedAt.toISOString()}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
