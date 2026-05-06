"use client";
import { signOut } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs text-ocean-400/60 hover:text-ocean-300 transition-colors px-2 py-1"
        title="Sair"
      >
        Sair
      </button>
    </form>
  );
}
