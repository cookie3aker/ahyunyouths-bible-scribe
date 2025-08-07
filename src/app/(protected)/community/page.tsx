import Link from "next/link";
import { Post } from "./_components/Post";

export default async function CommunityPage() {
  const MOCK_POSTS = [
    {
      id: 1,
      author: "김아현",
      content: "오늘의 필사에 대한 은혜를 나눠요!",
      likes: 10,
      createdAt: new Date("2023-10-01T10:00:00Z"),
      updatedAt: new Date("2023-10-01T12:00:00Z"),
    },
    {
      id: 2,
      author: "이아현",
      content: "파이팅!!!!",
      likes: 5,
      createdAt: new Date("2023-10-02T11:00:00Z"),
      updatedAt: new Date("2023-10-02T13:00:00Z"),
    },
    {
      id: 3,
      author: "서아현",
      content: "오늘도 왔다 갑니다~^^",
      likes: 2,
      createdAt: new Date("2023-10-04T11:00:00Z"),
      updatedAt: new Date("2023-10-04T13:00:00Z"),
    },
  ];

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
        {MOCK_POSTS.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            author={post.author}
            content={post.content}
            likes={post.likes}
            createdAt={post.createdAt.toISOString()}
            updatedAt={post.updatedAt.toISOString()}
          />
        ))}
      </div>
    </div>
  );
}
