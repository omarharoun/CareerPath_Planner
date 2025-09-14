export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppRedirectPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = user ? "/dashboard" : "/login";
  return (
    <meta httpEquiv="refresh" content={`0; url=${target}`} />
  );
}

