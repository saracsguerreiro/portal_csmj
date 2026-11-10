import { NextResponse } from "next/server";
import { ask } from "@/lib/api-ia";
import { getSession } from "@/lib/session";

/** A IA só é chamada quando a pessoa pergunta, e responde só com o que ela pode ler. */
export async function POST(req: Request) {
  const s = await getSession();
  const { q } = (await req.json()) as { q?: string };
  if (!q?.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  try {
    return NextResponse.json(ask(s, q));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
