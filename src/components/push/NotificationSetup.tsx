"use client";
import { useEffect, useState } from "react";

type Status = "idle" | "granted" | "denied" | "unsupported";

export function NotificationSetup() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setStatus("granted");
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setStatus("idle");
  }

  if (status === "unsupported") return null;

  return (
    <div className="glass p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-white">Notificações Push</p>
        <p className="text-xs text-ocean-400 mt-0.5">
          {status === "granted"
            ? "Ativas — você receberá lembretes de tarefas e medições"
            : status === "denied"
            ? "Bloqueadas pelo navegador"
            : "Receba lembretes de tarefas e medições"}
        </p>
      </div>
      {status === "granted" ? (
        <button
          onClick={unsubscribe}
          className="text-xs text-ocean-400 hover:text-status-danger transition-colors flex-shrink-0"
        >
          Desativar
        </button>
      ) : status !== "denied" ? (
        <button
          onClick={subscribe}
          className="bg-ocean-700 hover:bg-ocean-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          Ativar
        </button>
      ) : null}
    </div>
  );
}
