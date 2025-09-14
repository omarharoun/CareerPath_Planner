export const dynamic = "force-dynamic";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Authentication is coming soon.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <SignIn appearance={{ variables: { colorPrimary: "#111827" } }} />
    </div>
  );
}

