"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, ButtonLink, Checkbox, EmptyState, Segmented, SelectField, Sheet, StatusBadge, TextField, useToast } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { t } from "@/i18n";

const r = t.rooms;

type Block = { id: string; from: number; to: number; start: string; end: string; status: "aprovada" | "pendente"; mine: boolean; label: string };
type Row = { id: string; name: string; seats: number; zone: string; equipment: string[]; bookings: Block[] };
type Data = { day: string; dayLabel: string; isToday: boolean; holiday?: string; prev: string; next: string; rows: Row[]; week: { iso: string; label: string; holiday: boolean; rooms: { id: string; free: number }[] }[]; mine: { id: string; room: string; dayLabel: string; start: string; end: string; status: string; subject: string }[]; zones: string[] };

const HOURS = Array.from({ length: 20 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
const slotTime = (i: number) => (i >= 20 ? "18:00" : HOURS[i]);
const human = (t: string) => t.replace(":00", "h").replace(":30", "h30").replace(/^0/, "");

type Unit = { kind: "free"; slot: number } | { kind: "busy"; block: Block };

function unitsOf(row: Row): Unit[] {
  const out: Unit[] = [];
  for (let i = 0; i < 20; ) {
    const b = row.bookings.find((x) => x.from === i);
    if (b) { out.push({ kind: "busy", block: b }); i = b.to; } else { out.push({ kind: "free", slot: i }); i++; }
  }
  return out;
}

const busyAt = (row: Row, slot: number) => row.bookings.some((b) => slot >= b.from && slot < b.to);

/** Limites livres contíguos a partir de um espaço: os conflitos ficam impossíveis por desenho. */
function freeRun(row: Row, slot: number) {
  let a = slot; let b = slot;
  while (a > 0 && !busyAt(row, a - 1)) a--;
  while (b < 19 && !busyAt(row, b + 1)) b++;
  return [a, b] as const;
}

type Sel = { row: number; anchor: number; a: number; b: number };

export function RoomBooking({ data, view }: { data: Data; view: "dia" | "semana" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { show } = useToast();
  const [sel, setSel] = useState<Sel | null>(null);
  const [focus, setFocus] = useState<{ row: number; unit: number }>({ row: 0, unit: 0 });
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState<{ row: number; a: number; b: number } | null>(null);
  const [form, setForm] = useState({ subject: "", people: "", start: 0, end: 1, extras: [] as string[] });
  const [errors, setErrors] = useState<{ subject?: string; people?: string; server?: string }>({});
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<{ roomId: string; from: number; to: number; label: string }[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => data.rows.map((row) => ({ ...row, bookings: [...row.bookings, ...optimistic.filter((o) => o.roomId === row.id).map((o, i) => ({ id: `tmp${i}`, from: o.from, to: o.to, start: slotTime(o.from), end: slotTime(o.to), status: "pendente" as const, mine: true, label: o.label }))] })), [data.rows, optimistic]);
  const units = useMemo(() => rows.map(unitsOf), [rows]);
  useEffect(() => { setOptimistic([]); }, [data]);

  const setParam = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  const mats = (params.get("material") ?? "").split(",").filter(Boolean);
  const href = (dia: string) => { const n = new URLSearchParams(params.toString()); n.set("dia", dia); return `${pathname}?${n}`; };

  const open = (row: number, a: number, b: number) => {
    setSheet({ row, a, b });
    setForm({ subject: "", people: "", start: a, end: b + 1, extras: [] });
    setErrors({});
  };

  const extend = (row: number, anchor: number, to: number) => {
    const [lo, hi] = freeRun(rows[row], anchor);
    const target = Math.min(hi, Math.max(lo, to));
    setSel({ row, anchor, a: Math.min(anchor, target), b: Math.max(anchor, target) });
  };

  const focusUnit = (row: number, unit: number) => {
    setFocus({ row, unit });
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-cell="${row}-${unit}"]`)?.focus());
  };

  const onKey = (e: React.KeyboardEvent, row: number, unit: number) => {
    const u = units[row][unit];
    const slot = u.kind === "free" ? u.slot : u.block.from;
    if (e.key === "Escape") { setSel(null); return; }
    if ((e.key === "Enter" || e.key === " ") && u.kind === "free") {
      e.preventDefault();
      const s = sel && sel.row === row ? sel : { a: slot, b: slot };
      open(row, s.a, s.b);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      if (e.shiftKey && u.kind === "free") {
        const cur = sel && sel.row === row ? sel : { anchor: slot, a: slot, b: slot };
        const edge = dir > 0 ? cur.b + 1 : cur.a - 1;
        extend(row, cur.anchor, edge);
        return;
      }
      const next = Math.max(0, Math.min(units[row].length - 1, unit + dir));
      setSel(null);
      focusUnit(row, next);
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const nr = Math.max(0, Math.min(rows.length - 1, row + (e.key === "ArrowDown" ? 1 : -1)));
      const idx = units[nr].findIndex((x) => (x.kind === "free" ? x.slot === slot : slot >= x.block.from && slot < x.block.to));
      setSel(null);
      focusUnit(nr, Math.max(0, idx));
    }
  };

  const submit = async () => {
    if (!sheet) return;
    const room = rows[sheet.row];
    const next: typeof errors = {};
    if (!form.subject.trim()) next.subject = r.subjectError;
    if (!form.people || Number(form.people) < 1 || Number(form.people) > room.seats) next.people = r.peopleError(room.seats);
    setErrors(next);
    if (next.subject || next.people) return;
    setBusy(true);
    const tmp = { roomId: room.id, from: form.start, to: form.end, label: form.subject };
    setOptimistic((o) => [...o, tmp]);
    setSheet(null);
    setSel(null);
    try {
      await postService({ action: "booking.create", roomId: room.id, date: data.day, start: slotTime(form.start), end: slotTime(form.end), subject: form.subject, people: Number(form.people) });
      show({ message: r.sent });
    } catch (e) {
      setOptimistic((o) => o.filter((x) => x !== tmp));
      show({ message: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      await postService({ action: "booking.cancel", id });
      show({ message: r.cancelled, onUndo: async () => { await postService({ action: "booking.restore", id }).catch(() => {}); } });
    } catch (e) {
      show({ message: (e as Error).message });
    }
  };

  const sheetRoom = sheet ? rows[sheet.row] : null;
  const [lo, hi] = sheet && sheetRoom ? freeRun(sheetRoom, sheet.a) : [0, 0];

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1">
          <ButtonLink size="sm" variant="gh" href={href(data.prev)} aria-label={r.prevDay}><ChevronLeft size={18} aria-hidden /></ButtonLink>
          <h2 className="min-w-0 px-1 text-ui font-semibold text-ink first-letter:uppercase" aria-live="polite">{data.dayLabel}</h2>
          <ButtonLink size="sm" variant="gh" href={href(data.next)} aria-label={r.nextDay}><ChevronRight size={18} aria-hidden /></ButtonLink>
        </span>
        {!data.isToday && <ButtonLink size="sm" variant="sec" href={href("2026-11-09")}>{r.today}</ButtonLink>}
        <span className="hidden md:inline-flex"><Segmented legend={r.view} value={view} onChange={(v) => setParam({ vista: v === "semana" ? "semana" : null })} options={[{ value: "dia", label: r.day }, { value: "semana", label: r.week }]} /></span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <select aria-label={r.zone} className="filter-select" data-on={!!params.get("zona")} value={params.get("zona") ?? ""} onChange={(e) => setParam({ zona: e.target.value || null })}>
            <option value="">{r.zone}</option>
            {data.zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select aria-label={r.seats} className="filter-select" data-on={!!params.get("lugares")} value={params.get("lugares") ?? ""} onChange={(e) => setParam({ lugares: e.target.value || null })}>
            <option value="">{r.seats}</option>
            {[6, 8, 12, 20].map((n) => <option key={n} value={n}>{r.seatsAtLeast(n)}</option>)}
          </select>
          {r.equipment.map((m) => <button key={m} type="button" className="chip" aria-pressed={mats.includes(m)} onClick={() => setParam({ material: (mats.includes(m) ? mats.filter((x) => x !== m) : [...mats, m]).join(",") || null })}>{m}</button>)}
        </span>
      </div>
    </div>
  );

  const legend = (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-subtle" aria-label={r.legend}>
      <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-line-strong bg-surface" aria-hidden />{r.free}</li>
      <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-[var(--ds-status-info-bg)]" aria-hidden />{r.busy}</li>
      <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-dashed border-[var(--ds-content-subtle)]" aria-hidden />{r.pending}</li>
      <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-[var(--ds-brand-background-default)]" aria-hidden />{r.mine}</li>
    </ul>
  );

  return (
    <div className="flex flex-col gap-5">
      {toolbar}
      {data.holiday && <Alert tone="warn">{r.holiday(data.holiday)}</Alert>}
      {rows.length === 0 ? <EmptyState title={r.noRooms} /> : view === "semana" ? (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[640px] text-body">
            <caption className="sr-only">{r.week}</caption>
            <thead><tr><th scope="col" className="bg-surface-2 p-3 text-left text-label font-semibold text-subtle">{r.room}</th>{data.week.map((d) => <th key={d.iso} scope="col" className="bg-surface-2 p-3 text-left text-label font-semibold text-subtle first-letter:uppercase">{d.label}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <th scope="row" className="p-3 text-left font-semibold text-ink">{row.name}<span className="block text-caption font-normal text-subtle">{row.seats} lugares</span></th>
                  {data.week.map((d) => { const free = d.rooms.find((x) => x.id === row.id)?.free ?? 0; return <td key={d.iso} className="p-3">{d.holiday ? <span className="text-caption text-subtle">{t.events.holiday}</span> : <Link className="link-quiet" href={`${href(d.iso).replace(/&?vista=semana/, "")}`}>{free === 0 ? r.whole : r.freeHours(free)}</Link>}</td>; })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <p className="mb-2 text-label">{r.hint}</p>
            <div ref={gridRef} role="grid" aria-label={r.gridLabel(data.dayLabel)} aria-disabled={!!data.holiday} className="card overflow-x-auto !p-0 select-none" onPointerUp={() => { if (dragging && sel) { setDragging(false); open(sel.row, sel.a, sel.b); } }} onPointerLeave={() => setDragging(false)}>
              <div role="row" className="grid min-w-[880px] border-b border-line bg-surface-2" style={{ gridTemplateColumns: "176px repeat(20, minmax(0, 1fr))" }}>
                <span role="columnheader" className="p-2 text-label font-semibold text-subtle">{r.room}</span>
                {HOURS.map((h, i) => <span key={h} role="columnheader" aria-label={human(h)} className={`py-2 text-caption text-subtle ${i % 2 ? "" : "border-l border-line pl-1"}`}>{i % 2 ? "" : human(h)}</span>)}
              </div>
              {rows.map((row, ri) => (
                <div key={row.id} role="row" className="grid min-w-[880px] border-b border-line last:border-0" style={{ gridTemplateColumns: "176px repeat(20, minmax(0, 1fr))" }}>
                  <span role="rowheader" className="p-2"><span className="block text-label font-semibold text-ink">{row.name}</span><span className="text-caption text-subtle">{row.seats} lugares{row.equipment.length ? ` · ${row.equipment.join(", ")}` : ""}</span></span>
                  {data.holiday ? <span role="gridcell" aria-label={r.holiday(data.holiday)} className="m-1 rounded-lg bg-surface-2" style={{ gridColumn: "2 / span 20" }} /> : units[ri].map((u, ui) => {
                    const isFocus = focus.row === ri && focus.unit === ui;
                    if (u.kind === "busy") {
                      const b = u.block;
                      const style = b.mine ? { background: "var(--ds-brand-background-default)", color: "var(--ds-brand-content)" } : b.status === "pendente" ? { border: "1px dashed var(--ds-content-subtle)", color: "var(--ds-content-default)" } : { background: "var(--ds-status-info-bg)", color: "var(--ds-status-info-fg)" };
                      return <span key={b.id} role="gridcell" tabIndex={isFocus ? 0 : -1} data-cell={`${ri}-${ui}`} onKeyDown={(e) => onKey(e, ri, ui)} onFocus={() => setFocus({ row: ri, unit: ui })} aria-label={`${row.name}, ${human(b.start)} às ${human(b.end)}, ${b.mine ? `${r.mine}: ${b.label}${b.status === "pendente" ? `, ${r.pending}` : ""}` : b.label}`} className="m-1 flex min-h-12 items-center overflow-hidden rounded-lg px-2 text-caption font-semibold" style={{ gridColumn: `${b.from + 2} / ${b.to + 2}`, ...style }}><span className="truncate">{b.label}{b.mine && b.status === "pendente" ? ` · ${r.pending}` : ""}</span></span>;
                    }
                    const selected = !!sel && sel.row === ri && u.slot >= sel.a && u.slot <= sel.b;
                    return (
                      <span
                        key={`f${u.slot}`} role="gridcell" tabIndex={isFocus ? 0 : -1} data-cell={`${ri}-${ui}`} aria-selected={selected} aria-label={`${row.name}, ${human(slotTime(u.slot))} às ${human(slotTime(u.slot + 1))}, ${r.free}`}
                        onKeyDown={(e) => onKey(e, ri, ui)} onFocus={() => setFocus({ row: ri, unit: ui })}
                        onPointerDown={(e) => { if (e.button !== 0) return; e.preventDefault(); setDragging(true); setSel({ row: ri, anchor: u.slot, a: u.slot, b: u.slot }); setFocus({ row: ri, unit: ui }); }}
                        onPointerEnter={() => { if (dragging && sel && sel.row === ri) extend(ri, sel.anchor, u.slot); }}
                        className={`m-px min-h-12 cursor-pointer rounded-md border transition-colors ${selected ? "border-[var(--ds-content-brand)] bg-toned" : "border-transparent hover:border-line-strong hover:bg-surface-2"} ${u.slot % 2 ? "" : "border-l-line"}`}
                        style={{ gridColumn: `${u.slot + 2}` }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2">{legend}</div>
          </div>
          <ul className="flex flex-col gap-3 md:hidden">
            {rows.map((row, ri) => (
              <li key={row.id} className="card !p-4">
                <p className="font-semibold text-ink">{row.name}</p>
                <p className="text-caption text-subtle">{row.seats} lugares{row.equipment.length ? ` · ${row.equipment.join(", ")}` : ""}</p>
                {data.holiday ? <p className="mt-2 text-label">{t.events.holiday}</p> : (
                  <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" aria-label={`${r.pickSlot}: ${row.name}`}>
                    {Array.from({ length: 20 }, (_, i) => i).map((i) => {
                      const b = row.bookings.find((x) => i >= x.from && i < x.to);
                      if (b && b.from !== i) return null;
                      return <li key={i} className="flex-none">{b
                        ? <span className="inline-flex h-11 items-center rounded-full px-3 text-label" style={b.mine ? { background: "var(--ds-brand-background-default)", color: "var(--ds-brand-content)" } : { background: "var(--ds-status-info-bg)", color: "var(--ds-status-info-fg)" }}>{human(b.start)} · {b.label}</span>
                        : <button type="button" className="chip" onClick={() => { const [, h] = freeRun(row, i); open(ri, i, Math.min(h, i + 1)); }}>{human(slotTime(i))}</button>}</li>;
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <section aria-labelledby="minhas-reservas" className="card">
        <h2 id="minhas-reservas" className="mb-2 text-block font-semibold">{r.mineTitle}</h2>
        {data.mine.length === 0 ? <p className="text-body">{r.noMine}</p> : (
          <ul className="divide-y divide-[var(--ds-border-subtle)]">
            {data.mine.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span><span className="block font-semibold text-ink">{b.subject}</span><span className="text-label">{b.room} · {b.dayLabel}, {human(b.start)} às {human(b.end)}</span></span>
                <span className="flex items-center gap-2"><StatusBadge tone={b.status === "aprovada" ? "ok" : "info"}>{b.status === "aprovada" ? t.services.stepStates.done : r.pending}</StatusBadge><Button size="sm" variant="gh" onClick={() => cancel(b.id)}>{r.cancel}</Button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Sheet open={!!sheet} onClose={() => { setSheet(null); setSel(null); }} title={r.requestTitle} footer={<Button variant="pri" block loading={busy} onClick={submit}>{r.send}</Button>}>
        {sheet && sheetRoom && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-3 rounded-[16px] bg-surface-2 p-4 text-body">
              <div><dt className="text-label font-semibold text-ink">{r.room}</dt><dd>{sheetRoom.name}</dd></div>
              <div><dt className="text-label font-semibold text-ink">{r.date}</dt><dd className="first-letter:uppercase">{data.dayLabel}</dd></div>
            </dl>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label={r.start} value={String(form.start)} onChange={(e) => { const s = Number(e.target.value); setForm((f) => ({ ...f, start: s, end: Math.max(f.end, s + 1) })); }} options={Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((i) => ({ value: String(i), label: human(slotTime(i)) }))} />
              <SelectField label={r.end} value={String(form.end)} onChange={(e) => setForm((f) => ({ ...f, end: Number(e.target.value) }))} options={Array.from({ length: hi + 1 - form.start }, (_, i) => form.start + 1 + i).map((i) => ({ value: String(i), label: human(slotTime(i)) }))} />
            </div>
            <TextField label={r.subject} required autoFocus value={form.subject} error={errors.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            <TextField label={r.people} required type="number" inputMode="numeric" min={1} max={sheetRoom.seats} hint={`${sheetRoom.seats} lugares`} value={form.people} error={errors.people} onChange={(e) => setForm((f) => ({ ...f, people: e.target.value }))} />
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field-label mb-1.5 p-0">{r.material}</legend>
              {r.materialOptions.map((m) => <Checkbox key={m} checked={form.extras.includes(m)} onChange={(e) => setForm((f) => ({ ...f, extras: e.target.checked ? [...f.extras, m] : f.extras.filter((x) => x !== m) }))}>{m}</Checkbox>)}
            </fieldset>
            <p className="field-hint">{t.services.decides}: Secretaria da unidade · {t.services.avg(1)}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
