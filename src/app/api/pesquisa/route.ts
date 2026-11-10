import { NextResponse } from "next/server";
import { search } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const s = await getSession();
  if (s.failing) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ data: q.length >= 2 ? search(s, q) : [] });
}
