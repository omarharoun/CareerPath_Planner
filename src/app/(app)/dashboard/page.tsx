export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardHomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: skillsCount }, { count: jobsCount }, { count: savedCount }] = await Promise.all([
    supabase.from("skills").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("saved_resources").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}</h1>
      <p className="text-gray-600">Track your skills, knowledge, and job search progress.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Skills</div>
          <div className="text-2xl font-semibold">{skillsCount ?? 0}</div>
          <Link href="/dashboard/skills" className="text-sm underline">Manage skills</Link>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Jobs</div>
          <div className="text-2xl font-semibold">{jobsCount ?? 0}</div>
          <Link href="/dashboard/jobs" className="text-sm underline">Go to jobs</Link>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Saved</div>
          <div className="text-2xl font-semibold">{savedCount ?? 0}</div>
          <Link href="/dashboard/library" className="text-sm underline">Open library</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/coach" className="px-4 py-2 rounded border">Ask the AI Coach</Link>
        <Link href="/dashboard/resources" className="px-4 py-2 rounded border">Explore resources</Link>
        <Link href="/dashboard/learn" className="px-4 py-2 rounded border">Plan learning</Link>
      </div>
    </div>
  );
}

