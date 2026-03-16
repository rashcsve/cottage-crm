"use server";

import { createClient } from "@/../lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw new Error("Nepodařilo se odhlásit");

  redirect("/login");
}
