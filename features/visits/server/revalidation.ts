"use server";

import { revalidatePath } from "next/cache";

export async function revalidateVisitPaths(): void {
  revalidatePath("/dashboard/visits");
  revalidatePath("/(dashboard)/visits");
}
