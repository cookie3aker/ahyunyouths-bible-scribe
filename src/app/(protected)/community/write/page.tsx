import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function WritePage() {
  // onSubmit handler for the form
  const createPost = async (formData: FormData) => {
    "use server";

    await api.post.create({
      content: formData.get("content") as string,
    });

    redirect("/community");
  };

  return (
    <div className="container flex flex-col items-center justify-center gap-12">
      <h2>글쓰기</h2>
      <form className="w-full max-w-md" action={createPost}>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            내용
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          작성하기
        </button>
      </form>
    </div>
  );
}
