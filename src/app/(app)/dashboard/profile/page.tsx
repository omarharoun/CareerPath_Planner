export const dynamic = "force-dynamic";

import { currentUser, auth, clerkClient } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  const user = await currentUser();

  async function updateName(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const client = await clerkClient();
    const fullName = String(formData.get("full_name") || "").trim();
    const parts = fullName.split(" ").filter(Boolean);
    const firstName = parts[0] || undefined;
    const lastName = (parts.slice(1).join(" ") || undefined) as string | undefined;
    await client.users.updateUser(userId, { firstName, lastName });
  }

  const fullNameDefault = user?.fullName || "";

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <div className="space-y-6 max-w-md">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Email</div>
          <div className="mt-1">{user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress}</div>
        </div>

        <form action={updateName} className="border rounded p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input
              name="full_name"
              defaultValue={fullNameDefault}
              className="w-full border rounded px-3 py-2 bg-transparent"
            />
          </div>
          <button className="px-4 py-2 rounded border">Save</button>
        </form>
      </div>
    </div>
  );
}

