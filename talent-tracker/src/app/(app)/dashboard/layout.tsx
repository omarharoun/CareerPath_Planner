import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold">Talent Tracker</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard/skills">Skills</Link>
              <Link href="/dashboard/jobs">Jobs</Link>
              <Link href="/dashboard/coach">AI Coach</Link>
            </nav>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700">Sign out</button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

