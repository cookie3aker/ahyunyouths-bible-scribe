import Link from "next/link";
import { Post } from "./_components/Post";
import { api } from "~/trpc/server";

export default async function CommunityPage() {
  const posts = await api.post.getAllPosts();

  return (
    <div className="container flex flex-col items-center justify-center gap-12">
      <p>
        필사를 하며 느낀
        <br />
        은혜를 나눠줘!
      </p>
      <div className="flex w-full justify-end">
        <Link href="/community/write">글쓰기</Link>
      </div>
      <div className="w-full">
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
  );
}
