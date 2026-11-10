"use client";

import { CalendarOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Avatar, Button, DateRangeField, EmptyState, PersonPicker, SelectField, Sheet, StatusBadge, TextArea, useToast, type PickOption } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { t } from "@/i18n";

const a = t.absencesPage;

type Mine = { id: string; start: string; end: string; range: string; active: boolean; reason?: string; message?: string; substituteId: string; substitute: { name: string; initials: string; role: string } };

export function AbsenceManager({ mine, people }: { mine: Mine[]; people: PickOption[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [open, setOpen] = useState<Mine | "new" | null>(null);
  const [form, setForm] = useState({ start: "", end: "", substituteId: "", reason: "", message: "" });
  const [error, setError] = useState<{ sub?: string; range?: string; server?: string }>({});
  const [busy, setBusy] = useState(false);

  const edit = (m: Mine | "new") => {
    setOpen(m);
    setError({});
    setForm(m === "new" ? { start: "", end: "", substituteId: "", reason: "", message: "" } : { start: m.start, end: m.end, substituteId: m.substituteId, reason: m.reason ?? "", message: m.message ?? "" });
  };

  const save = async () => {
    const next: typeof error = {};
    if (!form.start || !form.end) next.range = t.services.requiredError(a.period);
    else if (form.end < form.start) next.range = t.services.rangeError;
    if (!form.substituteId) next.sub = a.errSub;
    setError(next);
    if (next.range || next.sub) return;
    setBusy(true);
    try {
      const res = await postService<{ warning?: string }>({ action: "absence.save", id: open !== "new" ? open?.id : undefined, ...form });
      setOpen(null);
      show({ message: res.warning ?? a.saved });
      router.refresh();
    } catch (e) {
      setError({ server: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const end = async (m: Mine) => {
    try {
      const res = await postService<{ before: string }>({ action: "absence.end", id: m.id });
      show({ message: a.ended, onUndo: async () => { await postService({ action: "absence.restore", id: m.id, end: res.before }).catch(() => {}); router.refresh(); } });
      router.refresh();
    } catch (e) {
      show({ message: (e as Error).message });
    }
  };

  return (
    <section aria-labelledby="minhas" className="card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="minhas" className="text-block font-semibold">{a.mine}</h2>
        <Button variant="pri" icon={<CalendarOff size={16} aria-hidden />} onClick={() => edit("new")}>{a.mark}</Button>
      </div>
      {mine.length === 0 ? <EmptyState plain title={a.noMine} /> : (
        <ul className="divide-y divide-[var(--ds-border-subtle)]">
          {mine.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">{m.range}<StatusBadge tone={m.active ? "info" : "neu"}>{m.active ? a.active : a.upcoming}</StatusBadge></p>
                <p className="mt-1 flex items-center gap-2 text-label"><Avatar initials={m.substitute.initials} size="sm" />{a.substitute}: {m.substitute.name}{m.reason ? ` · ${m.reason}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="sec" onClick={() => edit(m)}>{a.edit}</Button>
                {m.active && <Button size="sm" variant="gh" onClick={() => end(m)}>{a.endNow}</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-label text-subtle">{a.rule}</p>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open === "new" ? a.formTitle : a.editTitle} footer={<Button variant="pri" block loading={busy} onClick={save}>{a.save}</Button>}>
        <div className="flex flex-col gap-5">
          {error.server && <Alert tone="err">{error.server}</Alert>}
          <DateRangeField label={a.period} required start={form.start} end={form.end} error={error.range} onStart={(v) => setForm((f) => ({ ...f, start: v }))} onEnd={(v) => setForm((f) => ({ ...f, end: v }))} />
          <PersonPicker label={a.who} required hint={a.whoHint} people={people} value={form.substituteId || undefined} error={error.sub} onChange={(v) => setForm((f) => ({ ...f, substituteId: v ?? "" }))} />
          <SelectField label={a.reason} hint={a.reasonHint} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} options={[{ value: "", label: t.services.none }, ...a.reasons.map((x) => ({ value: x, label: x }))]} />
          <TextArea label={a.message} hint={a.messageHint} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        </div>
      </Sheet>
    </section>
  );
}
