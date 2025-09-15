export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold">Careero</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard/skills">Skills</Link>
              <Link href="/dashboard/jobs">Jobs</Link>
              <Link href="/dashboard/coach">AI Coach</Link>
              <Link href="/dashboard/career">Career</Link>
              <Link href="/dashboard/resources">Resources</Link>
              <Link href="/dashboard/library">Library</Link>
              <Link href="/dashboard/learn">Learn</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700">Profile</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

