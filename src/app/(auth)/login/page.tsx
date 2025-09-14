export const dynamic = "force-dynamic";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <SignIn appearance={{ variables: { colorPrimary: "#111827" } }} />
    </div>
  );
}

