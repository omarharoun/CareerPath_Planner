export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";

export default async function AppRedirectPage() {
  const user = await currentUser();

  const target = user ? "/dashboard" : "/login";
  return (
    <meta httpEquiv="refresh" content={`0; url=${target}`} />
  );
}

