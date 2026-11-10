import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/session";
import { resetStore } from "@/lib/store";

const allowed = new Set<string>(Object.values(COOKIE));

/** Grava preferências e controlos do protótipo em cookies, para a primeira resposta já vir certa. */
export async function POST(req: Request) {
  const body = (await req.json()) as { set?: Record<string, string | null>; reset?: boolean };
  const c = await cookies();
  if (body.reset) resetStore();
  for (const [k, v] of Object.entries(body.set ?? {})) {
    if (!allowed.has(k)) continue;
    if (v === null) c.delete(k);
    else c.set(k, v, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  }
  return NextResponse.json({ ok: true });
}
