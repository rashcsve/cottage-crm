"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "../../../lib/supabase/client";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSaving(false);

    if (error) {
      alert(error.message); // TODO
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">E-mail</label>
        <input
          type="email"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Heslo</label>
        <input
          type="password"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white disabled:opacity-60 cursor-pointer"
      >
        {isSaving ? "Přihlašuji..." : "Přihlásit se"}
      </button>

      <div className="pt-2 text-sm text-stone-600">
        Nemáš účet?{" "}
        <Link
          href="/signup"
          className="font-medium text-stone-800 underline underline-offset-4 transition hover:text-stone-600"
        >
          Zaregistrovat se
        </Link>
      </div>
    </form>
  );
}
