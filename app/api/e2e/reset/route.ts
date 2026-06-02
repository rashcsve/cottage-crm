import { NextResponse } from "next/server";

import { resetE2EMockState } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";

export async function POST() {
  if (!isE2EMockModeEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  resetE2EMockState();

  return NextResponse.json({ ok: true });
}
