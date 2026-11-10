import { events } from "@/data/events";
import { inScope } from "@/lib/scope";
import { getSession } from "@/lib/session";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Subscrição .ics do âmbito da pessoa, ou de um só evento com ?evento=. */
export async function GET(req: Request) {
  const s = await getSession();
  const only = new URL(req.url).searchParams.get("evento");
  const list = events.filter((e) => inScope(e, s.unit.id) && (!only || e.slug === only));
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CSMJ//Intranet//PT", ...list.flatMap((e) => ["BEGIN:VEVENT", `UID:${e.id}@intranet.csmj`, `DTSTAMP:${stamp(e.publishedAt)}`, `DTSTART:${stamp(e.startsAt)}`, `DTEND:${stamp(e.endsAt)}`, `SUMMARY:${e.title}`, `LOCATION:${e.place ?? "Online"}`, "END:VEVENT"]), "END:VCALENDAR"].join("\r\n");
  return new Response(body, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${only ?? "eventos-csmj"}.ics"` } });
}
