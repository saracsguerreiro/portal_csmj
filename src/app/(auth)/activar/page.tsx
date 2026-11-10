"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, ButtonLink, Checkbox, PasswordField, TextField, useToast, ToastProvider } from "@/design-system";
import { t } from "@/i18n";

const a = t.auth;
const TOTAL = 3;

const COMMON = ["password", "123456", "qwerty", "justica", "tribunal", "angola", "luanda"];

function scorePassword(p: string) {
  const low = p.toLowerCase();
  if (p.length < 8 || COMMON.some((c) => low.includes(c))) return 0;
  let s = 0;
  if (p.length >= 12) s += 1;
  if (p.length >= 16) s += 1;
  if (new Set(p).size >= 8 && /[^a-zA-Z]/.test(p)) s += 1;
  return s;
}

/** Código de exemplo do protótipo, gerado localmente. */
function FakeQr() {
  const cells = useMemo(() => {
    const size = 25;
    const out: [number, number][] = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) % 100;
    const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!finder(x, y) && rnd() < 48) out.push([x, y]);
    return out;
  }, []);
  const Finder = ({ x, y }: { x: number; y: number }) => <g><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>;
  return (
    <svg viewBox="-2 -2 29 29" width="176" height="176" role="img" aria-label={a.qrAlt} className="rounded-lg bg-white">
      <g fill="#000">{cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}<Finder x={0} y={0} /><Finder x={18} y={0} /><Finder x={0} y={18} /></g>
    </svg>
  );
}

const CODES = ["7KQ2-M9XD", "4TPL-8VNA", "R3HW-6ZCE", "9BGF-2YJK", "M6XU-3DQS", "2NVC-7HRT", "K8AE-5LWP", "6YZJ-9GMB", "Q4SD-1FXN", "5UHT-8CKR"];

function Steps() {
  const { show } = useToast();
  const [step, setStep] = useState(1);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<{ p1?: string; p2?: string }>({});
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [saved, setSaved] = useState(false);
  const score = scorePassword(p1);

  const header = (title: string) => (
    <>
      {step <= TOTAL && <p className="text-label font-medium text-subtle" aria-live="polite">{a.step(step, TOTAL)}</p>}
      <h1 className="text-page font-bold tracking-[-0.02em]">{title}</h1>
    </>
  );

  if (step === 1) return (
    <form
      noValidate className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const next = { p1: p1.length < 12 ? a.errShort : score === 0 ? a.errWeak : undefined, p2: p1 !== p2 ? a.errMismatch : undefined };
        setErr(next);
        if (!next.p1 && !next.p2) setStep(2);
      }}
    >
      {header(a.activateTitle)}
      <PasswordField label={a.newPassword} autoComplete="new-password" autoFocus hint={a.passwordRules} value={p1} error={err.p1} onChange={(e) => setP1(e.target.value)} />
      {p1 && (
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-4 gap-1" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 rounded-full" style={{ background: i <= score ? "var(--ds-brand-background-default)" : "var(--ds-border-subtle)" }} />)}</div>
          <p className="text-caption" aria-live="polite">{a.strength}: {a.strengthLevels[score]}</p>
        </div>
      )}
      <PasswordField label={a.confirmPassword} autoComplete="new-password" value={p2} error={err.p2} onChange={(e) => setP2(e.target.value)} />
      <Button type="submit" variant="pri" size="lg" block>{a.defineContinue}</Button>
    </form>
  );

  if (step === 2) return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (!/^\d{6}$/.test(code)) setCodeErr(a.errCode); else setStep(3); }}>
      {header(a.twoFactorTitle)}
      <p className="text-ui">{a.qrLead}</p>
      <FakeQr />
      <p className="text-body">{a.manualKey}: <code className="font-mono text-label text-ink">JBSW Y3DP EHPK 3PXP</code></p>
      <TextField label={a.code} inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} error={codeErr} onChange={(e) => { setCode(e.target.value); setCodeErr(""); }} />
      <Button type="submit" variant="pri" size="lg" block>{a.verify}</Button>
    </form>
  );

  if (step === 3) return (
    <div className="flex flex-col gap-4">
      {header(a.recoveryTitle)}
      <p className="text-ui">{a.recoveryLead}</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-[16px] bg-surface-2 p-4 font-mono text-label text-ink">{CODES.map((c) => <li key={c}>{c}</li>)}</ul>
      <div className="flex gap-2">
        <Button onClick={() => { const u = URL.createObjectURL(new Blob([CODES.join("\n")], { type: "text/plain" })); const l = document.createElement("a"); l.href = u; l.download = "codigos-recuperacao.txt"; l.click(); URL.revokeObjectURL(u); show({ message: a.downloaded }); }}>{a.download}</Button>
        <Button onClick={async () => { await navigator.clipboard.writeText(CODES.join("\n")); show({ message: a.copied }); }}>{a.copy}</Button>
      </div>
      <Checkbox checked={saved} onChange={(e) => setSaved(e.target.checked)}>{a.savedCheck}</Checkbox>
      <Button variant="pri" size="lg" block disabled={!saved} onClick={() => setStep(4)}>{a.finish}</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-page font-bold tracking-[-0.02em]">{a.doneTitle}</h1>
      <p className="text-ui">{a.doneLead}</p>
      <ButtonLink variant="pri" size="lg" block href="/entrar">{a.goSignIn}</ButtonLink>
    </div>
  );
}

export default function Activate() {
  return <ToastProvider><Steps /><Link href="/entrar" className="sr-only">{a.backToSignIn}</Link></ToastProvider>;
}
