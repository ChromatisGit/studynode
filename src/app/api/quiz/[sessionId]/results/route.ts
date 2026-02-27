import { getSession, isAdmin } from "@services/authService";
import { getQuizResults } from "@services/quizService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await getSession();
  if (!session || !isAdmin(session.user)) {
    return new Response(null, { status: 401 });
  }

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const results = await getQuizResults(sessionId, session.user);

  if (!results) {
    return new Response(null, { status: 404 });
  }

  if (results.phase === "closed") {
    // Session is done — tell callers to stop polling
    return new Response(null, { status: 410 });
  }

  const updatedAt = new Date(results.updatedAt);
  const lastModified = updatedAt.toUTCString();
  const ifModifiedSince = req.headers.get("If-Modified-Since");

  if (
    ifModifiedSince &&
    Math.floor(updatedAt.getTime() / 1000) <=
      Math.floor(new Date(ifModifiedSince).getTime() / 1000)
  ) {
    return new Response(null, {
      status: 304,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(results, {
    headers: {
      "Last-Modified": lastModified,
      "Cache-Control": "no-store, no-cache",
    },
  });
}
