"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { entity } from "@/config/entity";
import { Alert, Button, PasswordField, TextField } from "@/design-system";
import { setPrefs } from "@/features/shell/client-api";
import { t } from "@/i18n";
import { COOKIE } from "@/lib/cookies";

const a = t.auth;

export function SignInForm() {
  const params = useSearchParams();
  const [stage, setStage] = useState<"credentials" | "code">("credentials");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState<{ id?: string; pass?: string }>({});
  const [formError, setFormError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    await setPrefs({ [COOKIE.out]: null });
    const back = params.get("volta");
    window.location.replace(back && back.startsWith("/") && !back.startsWith("//") ? back : "/");
  };

  const onCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { id: id.trim() ? undefined : a.errRequiredId, pass: pass ? undefined : a.errRequiredPassword };
    setErrors(next);
    setFormError("");
    if (next.id || next.pass) return;
    if (pass === "erro") {
      const n = attempts + 1;
      setAttempts(n);
      setFormError(n >= 10 ? a.locked(15) : a.badCredentials);
      return;
    }
    setStage("code");
  };

  const onCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recovery && !/^\d{6}$/.test(code)) { setCodeError(a.errCode); return; }
    if (code === "000000") { setCodeError(a.badCode); return; }
    void finish();
  };

  if (stage === "code") {
    return (
      <form onSubmit={onCode} noValidate className="flex flex-col gap-4">
        <h1 className="text-page font-bold tracking-[-0.02em]">{a.twoFactorTitle}</h1>
        {!recovery && <p className="text-ui">{a.twoFactorLead}</p>}
        <TextField
          key={String(recovery)} autoFocus label={recovery ? a.recoveryCode : a.code} value={code} error={codeError} autoComplete="one-time-code"
          inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 16 : 6} onChange={(e) => { setCode(e.target.value); setCodeError(""); }}
        />
        <Button type="submit" variant="pri" size="lg" block loading={busy}>{a.verify}</Button>
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" className="link text-body" onClick={() => { setRecovery((r) => !r); setCode(""); setCodeError(""); }}>{recovery ? a.useApp : a.useRecovery}</button>
          <button type="button" className="link text-body" onClick={() => setStage("credentials")}>{a.backToSignIn}</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onCredentials} noValidate className="flex flex-col gap-4">
      <h1 className="text-page font-bold tracking-[-0.02em]">{a.signInTitle}</h1>
      {formError && <Alert tone="err">{formError}{attempts >= 3 && attempts < 10 ? ` ${a.attemptsLeft(10 - attempts)}` : ""}</Alert>}
      <TextField label={a.identifier} name="username" autoComplete="username" autoFocus value={id} error={errors.id} onChange={(e) => setId(e.target.value)} />
      <PasswordField label={a.password} name="password" autoComplete="current-password" value={pass} error={errors.pass} onChange={(e) => setPass(e.target.value)} />
      <Button type="submit" variant="pri" size="lg" block disabled={attempts >= 10}>{a.submit}</Button>
      <div className="flex items-center gap-3 text-label text-subtle"><hr className="rule flex-1" />{a.or}<hr className="rule flex-1" /></div>
      <Button size="lg" block icon={<Building2 size={18} aria-hidden />} onClick={finish} loading={busy}>{a.institution}</Button>
      <p className="text-body"><Link className="link" href="/recuperar">{a.forgot}</Link></p>
      <p className="text-body">{a.needHelp} <a className="link" href={`mailto:${entity.contacts.support}`}>{entity.contacts.support}</a></p>
      <p className="field-hint">{a.prototypeNote}</p>
    </form>
  );
}
