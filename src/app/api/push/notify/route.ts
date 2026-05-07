import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function setupVapid() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

async function notifyUser(
  userId: string,
  db: SupabaseClient<Database>
): Promise<number> {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const [{ data: tasks }, { data: subs }, { data: measurements }] = await Promise.all([
    db.from("tasks").select("id").eq("user_id", userId).lte("next_due", today).eq("status", "pendente"),
    db.from("push_subscriptions").select("*").eq("user_id", userId),
    db.from("measurements").select("measured_at").is("deleted_at", null).order("measured_at", { ascending: false }).limit(1),
  ]);

  if (!subs?.length) return 0;

  const notifications: { title: string; body: string; url: string }[] = [];

  if (tasks?.length) {
    notifications.push({
      title: "Pool Mind — Tarefas pendentes",
      body: `${tasks.length} tarefa${tasks.length > 1 ? "s" : ""} aguardando execução.`,
      url: "/tarefas",
    });
  }

  if (measurements?.[0]) {
    const daysSince = Math.floor(
      (Date.now() - new Date(measurements[0].measured_at).getTime()) / 864e5
    );
    if (daysSince >= 7) {
      notifications.push({
        title: "Pool Mind — Medição necessária",
        body: `Última medição há ${daysSince} dias. Verifique a química da piscina.`,
        url: "/medicoes",
      });
    }
  }

  if (!notifications.length) return 0;

  let sent = 0;
  for (const sub of subs) {
    for (const notif of notifications) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(notif)
        );
        sent++;
      } catch {
        await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return sent;
}

export async function POST(request: Request) {
  if (!setupVapid()) {
    return NextResponse.json({ error: "VAPID não configurado" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCron = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (isCron) {
    const admin = createAdminClient();
    const { data: allSubs } = await admin
      .from("push_subscriptions")
      .select("user_id");

    if (!allSubs?.length) return NextResponse.json({ sent: 0 });

    const userIds = [...new Set(allSubs.map((s) => s.user_id))];
    let total = 0;
    await Promise.all(
      userIds.map(async (userId) => {
        total += await notifyUser(userId, admin);
      })
    );

    return NextResponse.json({ sent: total });
  }

  // Per-user call (from the app)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sent = await notifyUser(user.id, supabase);
  return NextResponse.json({ sent });
}
