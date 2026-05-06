import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [{ data: tasks }, { data: subs }, { data: measurements }] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", user.id).lte("next_due", today).eq("status", "pendente"),
    supabase.from("push_subscriptions").select("*").eq("user_id", user.id),
    supabase.from("measurements").select("measured_at").order("measured_at", { ascending: false }).limit(1),
  ]);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

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

  if (!notifications.length) return NextResponse.json({ sent: 0 });

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
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return NextResponse.json({ sent });
}
