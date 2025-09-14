export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function updateName(formData: FormData) {
    "use server";
    const supabase = createSupabaseServerClient();
    const fullName = String(formData.get("full_name") || "");
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <div className="space-y-6 max-w-md">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Email</div>
          <div className="mt-1">{user?.email}</div>
        </div>

        <form action={updateName} className="border rounded p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input
              name="full_name"
              defaultValue={(user?.user_metadata as any)?.full_name || ""}
              className="w-full border rounded px-3 py-2 bg-transparent"
            />
          </div>
          <button className="px-4 py-2 rounded border">Save</button>
        </form>
      </div>
    </div>
  );
}

