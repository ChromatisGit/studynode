import { getSession, isAdmin } from "@services/authService";
import { withAnonTx } from "@db/tx";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHANNEL_RE = /^[a-z0-9-]{1,64}$/;
const STALE_MS = 15 * 60 * 1000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const session = await getSession();
  if (!session || !isAdmin(session.user)) {
    return new Response(null, { status: 401 });
  }

  const { channel } = await params;
  if (!CHANNEL_RE.test(channel)) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  }

  const [row] = await withAnonTx((tx) => tx`
    SELECT state, updated_at, last_heartbeat
    FROM slide_sessions
    WHERE channel_name = ${channel}
  `);

  if (!row) return new Response(null, { status: 404 });

  if (Date.now() - new Date(row.last_heartbeat as string).getTime() > STALE_MS) {
    return new Response(null, { status: 410 });
  }

  const lastModified = new Date(row.updated_at as string).toUTCString();
  const ifModifiedSince = req.headers.get("If-Modified-Since");
  if (
    ifModifiedSince &&
    new Date(row.updated_at as string) <= new Date(ifModifiedSince)
  ) {
    return new Response(null, {
      status: 304,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(row.state, {
    headers: {
      "Last-Modified": lastModified,
      "Cache-Control": "no-store, no-cache",
    },
  });
}
