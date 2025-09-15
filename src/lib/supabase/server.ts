import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Did you set up your environment variables?"
    );
  }

  const { getToken } = await auth();
  const clerkSupabaseToken = await (getToken ? getToken({ template: "supabase" }).catch(() => null) : Promise.resolve(null));

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const store = await cookies();
        return store.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      async setAll(cookiesToSet) {
        const store = await cookies();
        for (const { name, value, options } of cookiesToSet) {
          try {
            store.set(name, value, options);
          } catch {
            // ignore when not allowed (e.g., in some Server Component contexts)
          }
        }
      },
    },
    global: {
      headers: clerkSupabaseToken ? { Authorization: `Bearer ${clerkSupabaseToken}` } : undefined,
    },
  });
}

