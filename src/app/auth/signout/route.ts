export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { sessionId } = await auth();
  if (sessionId) {
    try {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    } catch {}
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

