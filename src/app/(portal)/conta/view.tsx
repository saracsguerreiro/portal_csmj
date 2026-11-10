"use client";

import { Laptop, Smartphone } from "lucide-react";
import { useState } from "react";
import { Avatar, Button, ButtonLink, Dialog, LinkTabs, PageHeader, PasswordField, SelectField, StatusBadge, Switch, TextField, useToast } from "@/design-system";
import { DensityControl, ThemeControl } from "@/features/shell/AccountMenu";
import { postAction, setPrefs } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { notifPrefs } from "@/lib/api-participar";
import { useSession } from "@/lib/client";
import { COOKIE } from "@/lib/cookies";
import { stateOf } from "@/lib/store";
import { useQuery } from "@/lib/use-query";

const a = t.account;
const TABS = ["perfil", "preferencias", "notificacoes", "seguranca", "ausencias"] as const;
const CODES = ["3HQ8-K2LD", "9WMT-4XRA", "P6ZC-1NEV", "B7FJ-8QSU", "M2TY-5DWK", "R9LE-3HGP", "C4VN-7AZB", "X1KS-6PMF", "T8DG-2YJC", "H5RU-9BNE"];

export function AccountView() {
  const s = useSession();
  const { separador } = useQuery();
  const tab = (TABS as readonly string[]).includes(separador ?? "") ? separador! : "perfil";
  const { show } = useToast();
  const st = stateOf(s.person.id);
  const [mobile, setMobile] = useState(st.profile.mobile ?? s.person.mobile ?? "");
  const [room, setRoom] = useState(st.profile.room ?? s.person.room ?? "");
  const [birthday, setBirthday] = useState((st.profile.showBirthday ?? String(!!s.person.showBirthday)) === "true");
  const [prefs, setP] = useState(notifPrefs(s));
  const [news, setNews] = useState(st.notifPrefs["newsletter"] ?? true);
  const [pw, setPw] = useState({ cur: "", a: "", b: "" });
  const [pwErr, setPwErr] = useState<{ cur?: string; a?: string; b?: string }>({});
  const [codes, setCodes] = useState(false);
  const ended = st.endedSessions;

  const toggle = async (key: string, value: boolean) => {
    setP((list) => list.map((x) => (key.startsWith(`${x.id}:`) ? { ...x, [key.split(":")[1]]: value } : x)));
    await postAction({ action: "notif.pref", key, value }).catch(() => {});
  };
  const sessions = [{ id: "este", label: `${a.thisDevice} · Chrome`, where: "Luanda · agora", icon: Laptop }, { id: "telemovel", label: "Telemóvel · Safari", where: "Luanda · há 2 h", icon: Smartphone }, { id: "portatil", label: "Portátil · Edge", where: "Benguela · há 3 dias", icon: Laptop }].filter((x) => !ended.includes(x.id));

  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader title={a.title} description={a.lead} />
      <LinkTabs label={a.title} tabs={TABS.map((k) => ({ href: k === "perfil" ? "/conta" : `/conta?separador=${k}`, label: a.tabs[k], current: tab === k }))} />
      {tab === "perfil" && (
        <form className="card flex max-w-[760px] flex-col gap-5" onSubmit={async (e) => { e.preventDefault(); await postAction({ action: "profile.save", fields: { mobile, room, showBirthday: String(birthday) } }); show({ message: a.saved }); }}>
          <div className="flex items-center gap-4"><Avatar initials={s.person.initials} size="lg" /><div><Button size="sm" onClick={() => show({ message: a.photoNote })}>{a.changePhoto}</Button><p className="field-hint mt-1">{a.photoNote}</p></div></div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[[a.name, s.person.name], [a.role, s.person.role], [a.units, s.myUnits.map((u) => u.short).join(", ")]].map(([k, v]) => <div key={k}><dt className="text-label font-semibold text-ink">{k}</dt><dd className="text-ui">{v}</dd></div>)}
          </dl>
          <p className="field-hint">{a.managedByHr}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={a.mobile} type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <TextField label={a.room} value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>
          <Switch checked={birthday} onChange={(e) => setBirthday(e.target.checked)}>{a.showBirthday}</Switch>
          <span><Button type="submit" variant="pri">{a.save}</Button></span>
        </form>
      )}
      {tab === "preferencias" && (
        <section className="card flex max-w-[760px] flex-col gap-5">
          <SelectField label={a.language} value="pt-AO" onChange={() => show({ message: a.languages[1].label })} options={a.languages} />
          <div className="flex flex-col items-start gap-1"><span className="field-label">{t.shell.theme}</span><ThemeControl /></div>
          <div className="flex flex-col items-start gap-1"><span className="field-label">{t.shell.density}</span><DensityControl /></div>
          <SelectField label={a.defaultUnit} value={s.unit.id} onChange={async (e) => { await setPrefs({ [COOKIE.unit]: e.target.value }); show({ message: a.prefsSaved }); }} options={s.myUnits.map((u) => ({ value: u.id, label: u.short }))} />
        </section>
      )}
      {tab === "notificacoes" && (
        <section className="card flex min-w-0 flex-col gap-4">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full text-body">
              <caption className="mb-2 text-left text-block font-semibold text-ink">{a.notifTable}</caption>
              <thead><tr className="text-left text-label text-subtle"><th scope="col" className="bg-surface-2 p-3 font-semibold">{a.typeCol}</th><th scope="col" className="bg-surface-2 p-3 font-semibold">{a.bell}</th><th scope="col" className="bg-surface-2 p-3 font-semibold">{a.email}</th></tr></thead>
              <tbody>{prefs.map((p) => <tr key={p.id} className="border-t border-line"><th scope="row" className="p-3 text-left font-medium text-ink">{p.label}</th><td className="p-3"><Switch checked={p.bell} onChange={(e) => toggle(`${p.id}:bell`, e.target.checked)}><span className="sr-only">{`${a.bell}: ${p.label}`}</span></Switch></td><td className="p-3"><Switch checked={p.email} onChange={(e) => toggle(`${p.id}:email`, e.target.checked)}><span className="sr-only">{`${a.email}: ${p.label}`}</span></Switch></td></tr>)}</tbody>
            </table>
          </div>
          <Switch checked={news} onChange={async (e) => { setNews(e.target.checked); await postAction({ action: "notif.pref", key: "newsletter", value: e.target.checked }).catch(() => {}); }}>{a.newsletter}</Switch>
        </section>
      )}
      {tab === "seguranca" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form noValidate className="card flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); const err = { cur: pw.cur ? undefined : a.errCurrent, a: pw.a.length < 12 ? t.auth.errShort : undefined, b: pw.a !== pw.b ? t.auth.errMismatch : undefined }; setPwErr(err); if (!err.cur && !err.a && !err.b) { setPw({ cur: "", a: "", b: "" }); show({ message: a.passwordSaved }); } }}>
            <h2 className="text-block font-semibold">{a.password}</h2>
            <PasswordField label={a.current} autoComplete="current-password" value={pw.cur} error={pwErr.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
            <PasswordField label={a.newPass} autoComplete="new-password" hint={t.auth.passwordRules} value={pw.a} error={pwErr.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} />
            <PasswordField label={a.confirm} autoComplete="new-password" value={pw.b} error={pwErr.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} />
            <span><Button type="submit" variant="pri">{a.password}</Button></span>
          </form>
          <div className="flex flex-col gap-6">
            <section className="card flex flex-col items-start gap-3"><h2 className="text-block font-semibold">{a.twoFactor}</h2><p className="flex items-center gap-2 text-body"><StatusBadge tone="ok">Activa</StatusBadge>{a.twoFactorOn}</p><Button onClick={() => setCodes(true)}>{a.newCodes}</Button></section>
            <section className="card flex flex-col gap-2"><h2 className="text-block font-semibold">{a.sessions}</h2><ul className="divide-y divide-[var(--ds-border-subtle)]">{sessions.map((x) => <li key={x.id} className="flex items-center gap-3 py-2"><x.icon size={20} aria-hidden className="text-subtle" /><span className="flex-1"><span className="block font-medium text-ink">{x.label}</span><span className="text-caption text-subtle">{x.where}</span></span>{x.id !== "este" && <Button size="sm" variant="gh" onClick={async () => { await postAction({ action: "session.end", id: x.id }); show({ message: a.ended }); }}>{a.end}</Button>}</li>)}</ul></section>
            <section className="card flex flex-col gap-2"><h2 className="text-block font-semibold">{a.methods}</h2><ul className="flex flex-col gap-2 text-body"><li className="flex items-center justify-between">{a.methodPassword}<StatusBadge tone="ok">{a.linked}</StatusBadge></li><li className="flex items-center justify-between">{a.methodInstitution}<StatusBadge tone="ok">{a.linked}</StatusBadge></li></ul></section>
          </div>
          <Dialog open={codes} onClose={() => setCodes(false)} title={a.codesTitle} actions={<Button variant="pri" onClick={() => setCodes(false)}>{a.done}</Button>}>
            <p>{a.codesBody}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-[12px] bg-surface-2 p-4 font-mono text-label text-ink">{CODES.map((c) => <li key={c}>{c}</li>)}</ul>
          </Dialog>
        </div>
      )}
      {tab === "ausencias" && <section className="card flex max-w-[760px] flex-col items-start gap-3"><p className="text-ui">{a.absencesLead}</p><ButtonLink variant="pri" href="/servicos/ausencias">{a.absencesGo}</ButtonLink></section>}
    </div>
  );
}
