"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) router.replace("/dashboard");
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in or create an account to track skills and job applications.
        </p>
        <Auth
          supabaseClient={supabase}
          providers={["google", "github"]}
          appearance={{ theme: ThemeSupa }}
          redirectTo={typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined}
        />
        <div className="mt-4 text-xs text-gray-500">
          By continuing, you agree to our <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}

