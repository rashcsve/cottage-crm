"use client";

import { useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";

export function SignupForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage("Registrace se nepodařila. Zkus to prosím znovu.");
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
        <label className="mb-1 block text-sm font-medium">Jméno</label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">E-mail</label>
        <input
          type="email"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Heslo</label>
        <input
          type="password"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white disabled:opacity-60 cursor-pointer"
      >
        {isSaving ? "Vytvářím účet..." : "Registrovat se"}
      </button>

      <div className="pt-2 text-sm text-stone-600">
        Už máš účet?{" "}
        <Link
          href="/login"
          className="font-medium text-stone-800 underline underline-offset-4 transition hover:text-stone-600"
        >
          Přihlásit se
        </Link>
      </div>
    </form>
  );
}
