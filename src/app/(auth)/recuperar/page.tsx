"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, TextField } from "@/design-system";
import { t } from "@/i18n";

const a = t.auth;

export default function Recover() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page font-bold tracking-[-0.02em]">{a.sentTitle}</h1>
        <Alert tone="ok">{a.sent}</Alert>
        <p className="text-body">{a.noEmail}</p>
        <div className="flex flex-wrap gap-4 text-body">
          <Link className="link" href="/entrar">{a.backToSignIn}</Link>
          <Link className="link" href="/activar?token=exemplo">{a.prototypeOpenLink}</Link>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate className="flex flex-col gap-4"
      onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) setError(a.errEmail); else setSent(true); }}
    >
      <h1 className="text-page font-bold tracking-[-0.02em]">{a.recoverTitle}</h1>
      <p className="text-ui">{a.recoverLead}</p>
      <TextField label={a.email} type="email" autoComplete="email" autoFocus value={email} error={error} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
      <Button type="submit" variant="pri" size="lg" block>{a.sendInstructions}</Button>
      <Link className="link text-body" href="/entrar">{a.backToSignIn}</Link>
    </form>
  );
}
