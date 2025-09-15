export const dynamic = "force-dynamic";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInAliasPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <SignIn appearance={{ variables: { colorPrimary: "#111827" } }} forceRedirectUrl="/dashboard" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Don’t have an account? <Link href="/sign-up" className="underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

