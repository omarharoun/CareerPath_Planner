export const dynamic = "force-dynamic";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Create account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Sign up is coming soon.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <SignUp appearance={{ variables: { colorPrimary: "#111827" } }} forceRedirectUrl="/dashboard" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

