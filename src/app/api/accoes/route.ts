import { NextResponse } from "next/server";
import { notices } from "@/data/notices";
import { getSession } from "@/lib/session";
import { extra, stateOf } from "@/lib/store";

type Body =
  | { action: "task.done" | "task.undo" | "task.postpone" | "task.unpostpone"; id: string }
  | { action: "notice.confirm"; id: string }
  | { action: "notifications.readAll" }
  | { action: "shortcuts.save"; ids: string[] }
  | { action: "event.set"; id: string; value: "none" | "going" | "waitlist" | "pending" }
  | { action: "reaction.set"; id: string; kind: string | null }
  | { action: "saved.toggle"; id: string }
  | { action: "poll.vote"; id: string; option: string }
  | { action: "comment.add"; id: string; text: string; replyTo?: string };

const stamp = () => new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Luanda" }).format(new Date());

/** Ponto único de escrita do protótipo. Numa API real seriam recursos separados, com permissões verificadas. */
export async function POST(req: Request) {
  const s = await getSession();
  if (s.failing) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const body = (await req.json()) as Body;
  const st = stateOf(s.person.id);
  switch (body.action) {
    case "task.done":
      st.doneTasks.add(body.id);
      if (body.id === "t-evento") st.rsvp.set("e2", "going");
      break;
    case "task.undo":
      st.doneTasks.delete(body.id);
      if (body.id === "t-evento") st.rsvp.delete("e2");
      break;
    case "task.postpone": st.postponed.add(body.id); break;
    case "task.unpostpone": st.postponed.delete(body.id); break;
    case "notice.confirm": {
      const n = notices.find((x) => x.id === body.id);
      if (!n) return NextResponse.json({ error: "not-found" }, { status: 404 });
      st.confirmed.set(`${n.id}:${n.version}`, stamp());
      break;
    }
    case "notifications.readAll": st.readAll = true; break;
    case "shortcuts.save": st.shortcuts = body.ids.slice(0, 8); break;
    case "event.set":
      if (body.value === "none") st.rsvp.delete(body.id); else st.rsvp.set(body.id, body.value);
      if (body.id === "e2") { if (body.value === "none") st.doneTasks.delete("t-evento"); else st.doneTasks.add("t-evento"); }
      break;
    case "reaction.set":
      if (body.kind) st.reacted.set(body.id, body.kind); else st.reacted.delete(body.id);
      break;
    case "saved.toggle":
      if (st.saved.has(body.id)) st.saved.delete(body.id); else st.saved.add(body.id);
      break;
    case "poll.vote":
      st.votes.set(body.id, body.option);
      st.doneTasks.add(body.id);
      break;
    case "comment.add": {
      const text = body.text.trim();
      if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
      extra.comments.push({ id: `x${Date.now()}`, newsId: body.id, authorId: s.person.id, text, at: new Date().toISOString(), replyTo: body.replyTo });
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
