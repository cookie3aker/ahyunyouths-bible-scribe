import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

interface SetProfileModalProps {
  email: string;
  name: string;
}

export async function SetProfileModal({ email, name }: SetProfileModalProps) {
  const groups = await api.group.getGroups();

  const save = async (formData: FormData) => {
    "use server";

    await api.user.update({
      name: formData.get("name") as string,
      groupId: Number(formData.get("group")),
    });
    redirect("/");
  };

  return (
    <div className="bg-opacity-50 absolute inset-0 flex max-w-[768px] flex-col items-center justify-center bg-white">
      <h2 className="mb-8">환영합니다! 소속 소그룹을 선택해주세요!</h2>

      <form action={save} className="flex flex-col gap-8">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled
            defaultValue={email}
            className="border-b-1"
          />
        </div>

        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={name}
            className="border-b-1"
          />
        </div>

        <div>
          <label htmlFor="group">소그룹 선택:</label>
          <select id="group" name="group" required>
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="cursor-pointer border p-2">
          저장하기
        </button>
      </form>
    </div>
  );
}
