"use client";
import { useState } from "react";
import { signOut } from "@/app/login/actions";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      if ("serviceWorker" in navigator) {
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
      }
    } catch {
      // silently continue — push cleanup failure must not block logout
    }
    await signOut();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="text-xs text-ocean-400/60 hover:text-ocean-300 transition-colors px-2 py-1 disabled:opacity-40"
      title="Sair"
    >
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}
