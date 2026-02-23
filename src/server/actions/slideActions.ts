"use server";

import { getSession, isAdmin } from "@services/authService";
import { withAnonTx } from "@db/tx";
import { z } from "zod/v4";

const CHANNEL_RE = /^[a-z0-9-]{1,64}$/;

// pointer excluded — laser pointer is same-device only via BroadcastChannel
// interactiveState: Record<string,string> mirrors current SlideState type
const SlideStateSchema = z.object({
  slideIndex: z.number().int().min(0),
  blackout: z.boolean(),
  interactiveState: z.record(z.string(), z.string()),
});

export async function updateSlideStateAction(
  channelName: string,
  rawState: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || !isAdmin(session.user)) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!CHANNEL_RE.test(channelName)) {
    return { ok: false, error: "Invalid channel name" };
  }

  const parsed = SlideStateSchema.safeParse(rawState);
  if (!parsed.success) {
    return { ok: false, error: "Invalid state" };
  }

  const stateJson = JSON.stringify(parsed.data);

  await withAnonTx(async (tx) => {
    await tx`DELETE FROM slide_sessions WHERE last_heartbeat < now() - INTERVAL '48 hours'`;
    await tx`
      INSERT INTO slide_sessions (channel_name, state, updated_at, last_heartbeat)
        VALUES (${channelName}, ${stateJson}::jsonb, now(), now())
      ON CONFLICT (channel_name) DO UPDATE
        SET state          = EXCLUDED.state,
            updated_at     = now(),
            last_heartbeat = now()
    `;
  });

  return { ok: true };
}

export async function heartbeatSlideSessionAction(channelName: string): Promise<void> {
  const session = await getSession();
  if (!session || !isAdmin(session.user)) return;
  if (!CHANNEL_RE.test(channelName)) return;

  await withAnonTx((tx) =>
    tx`UPDATE slide_sessions SET last_heartbeat = now() WHERE channel_name = ${channelName}`
  );
}
