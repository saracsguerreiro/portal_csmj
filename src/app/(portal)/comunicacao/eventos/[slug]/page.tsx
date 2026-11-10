import { CalendarPlus, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Breadcrumbs, Button, ButtonLink, DateMark, ScopeTag } from "@/design-system";
import { Denied, modeIcon } from "@/features/comunicacao/content";
import { RsvpControl } from "@/features/comunicacao/interactive";
import { events } from "@/data/events";
import { t } from "@/i18n";
import { getEvent } from "@/lib/api-comunicacao";
import { getSession } from "@/lib/session";

const ev = t.events;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: events.find((e) => e.slug === slug)?.title ?? ev.title };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getSession();
  const data = getEvent(s, slug);
  if (data.status === "missing") notFound();
  if (data.status === "denied") return <Denied />;
  const e = data.event;
  const Icon = modeIcon[e.mode];
  const signup = (
    <>
      <div className="flex flex-col gap-1 text-body">
        {e.hasSignup && <span className="font-semibold text-ink">{e.full ? ev.full : ev.spots(e.free ?? 0)}</span>}
        {e.deadlineLabel && <span>{e.closed ? ev.closed : ev.until(e.deadlineLabel)}</span>}
      </div>
      <RsvpControl id={e.id} rsvp={e.rsvp} full={e.full} closed={e.closed} needsApproval={e.needsApproval} hasSignup={e.hasSignup} />
      <ButtonLink variant="gh" size="sm" href={`/api/calendario?evento=${e.slug}`} prefetch={false} icon={<CalendarPlus size={16} aria-hidden />}>{ev.addOne}</ButtonLink>
    </>
  );
  return (
    <div className="wrap py-6 md:py-8">
      <Breadcrumbs items={[{ label: t.news.crumb, href: "/comunicacao/noticias" }, { label: ev.title, href: "/comunicacao/eventos" }, { label: e.title }]} label={t.shell.crumbs} />
      <div className="mt-4 grid gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <header className="flex gap-5">
            <DateMark day={e.day} month={e.month} large />
            <div className="min-w-0">
              <h1 className="text-page font-bold tracking-[-0.02em]">{e.title}</h1>
              <p className="mt-2 text-ui">{e.whenLong}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-subtle">
                <span className="scope !text-label"><Icon size={14} aria-hidden />{ev.modes[e.mode]}</span>
                <ScopeTag kind={e.scopeKind}>{e.scopeLabel}</ScopeTag>
                <span>{ev.organizer}: {e.organizer}</span>
              </p>
            </div>
          </header>
          <section aria-labelledby="onde">
            <h2 id="onde" className="mb-3 text-section font-bold">{ev.where}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {e.mode !== "online" && (
                <div className="flex flex-col gap-2 text-body">
                  <img src="/covers/mapa.svg" alt={ev.mapAlt} width={800} height={400} loading="lazy" className="cover-img aspect-[2/1] w-full rounded-[16px] object-cover" />
                  <p><b className="text-ink">{e.place}</b>{e.address ? ` · ${e.address}` : ""}</p>
                </div>
              )}
              {e.mode !== "presencial" && (
                <div className="flex flex-col items-start gap-2 text-body">
                  <Button variant="sec" disabled icon={<MonitorPlay size={16} aria-hidden />}>{ev.watch}</Button>
                  <p className="field-hint">{ev.watchWhen}</p>
                </div>
              )}
            </div>
          </section>
          <section aria-labelledby="sobre" className="prose-read">
            <h2 id="sobre" className="!mt-0">{ev.aboutTitle}</h2>
            {e.description.map((p) => <p key={p}>{p}</p>)}
            {e.programme && (
              <>
                <h2>{ev.programme}</h2>
                <ul className="!list-none !pl-0">{e.programme.map((x) => <li key={x.time} className="flex gap-4 border-b border-line pb-2"><span className="w-14 flex-none font-semibold tabular-nums text-ink">{x.time}</span>{x.title}</li>)}</ul>
              </>
            )}
          </section>
          {e.speakers.length > 0 && (
            <section aria-labelledby="oradores">
              <h2 id="oradores" className="mb-3 text-section font-bold">{ev.speakers}</h2>
              <ul className="grid gap-4 sm:grid-cols-2">{e.speakers.map((p) => <li key={p.slug}><Link href={`/pessoas/${p.slug}`} className="row-link flex items-center gap-3"><Avatar initials={p.initials} /><span><span className="row-title block font-semibold text-ink">{p.name}</span><span className="text-label text-subtle">{p.role} · {p.unit}</span></span></Link></li>)}</ul>
            </section>
          )}
          {e.showAttendees && e.goingCount > 0 && (
            <section aria-labelledby="quem-vai">
              <h2 id="quem-vai" className="mb-3 text-section font-bold">{ev.whoGoes}</h2>
              <div className="flex items-center gap-3">
                <span className="flex -space-x-2">{data.attendees.map((p) => <span key={p.slug} className="rounded-full ring-2 ring-[var(--ds-background-app)]"><Avatar initials={p.initials} size="sm" label={p.name} /></span>)}</span>
                <span className="text-body">{ev.goingCount(e.goingCount)}</span>
              </div>
            </section>
          )}
        </div>
        <aside aria-label={ev.signup} className="hidden lg:col-span-4 lg:block">
          <div className="card sticky top-24 flex flex-col gap-4">
            <h2 className="text-block font-semibold">{ev.signup}</h2>
            {signup}
          </div>
        </aside>
      </div>
      <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t border-line bg-surface px-4 py-3 md:bottom-0 lg:hidden">
        {signup}
      </div>
    </div>
  );
}
