"use client";

import { createBrowserClient } from "@supabase/ssr";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: { template?: string }) => Promise<string | null>;
      };
    };
  }
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Did you set up your environment variables?"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers || {});
        try {
          if (typeof window !== "undefined" && window.Clerk?.session?.getToken) {
            const token = await window.Clerk.session.getToken({ template: "supabase" });
            if (token) headers.set("Authorization", `Bearer ${token}`);
          }
        } catch {}
        return fetch(input, { ...init, headers });
      },
    },
  });
}

