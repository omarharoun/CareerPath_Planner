import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Did you set up your environment variables?"
    );
  }

  type CookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
    priority?: "low" | "medium" | "high";
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          // In Route Handlers, this will persist. In Server Components, Next.js may ignore set.
          cookies().set({ name, value, ...options });
        } catch {
          // no-op when not allowed
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookies().set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // no-op when not allowed
        }
      },
    },
  });
}

