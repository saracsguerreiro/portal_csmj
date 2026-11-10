"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ConfirmDialog, TextArea, useToast } from "@/design-system";
import { postService } from "@/features/shell/client-api";
import { t } from "@/i18n";

const a = t.approvals;

/** Cartão de decisão: comentário obrigatório para devolver ou recusar; recusar pede confirmação. */
export function DecisionPanel({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRefuse, setConfirmRefuse] = useState(false);

  const decide = async (verdict: "approve" | "return" | "refuse") => {
    if (verdict !== "approve" && !comment.trim()) { setError(a.commentNeeded); document.getElementById("decisao-comentario")?.focus(); return; }
    setBusy(verdict);
    try {
      await postService({ action: "decision", id, verdict, comment });
      show({ message: verdict === "approve" ? a.approved : verdict === "return" ? a.returned : a.refused });
      router.push("/servicos/aprovacoes");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TextArea id="decisao-comentario" label={a.comment} hint={a.commentHint} value={comment} error={error} onChange={(e) => { setComment(e.target.value); setError(""); }} />
      <Button variant="pri" block loading={busy === "approve"} onClick={() => decide("approve")}>{a.approve}</Button>
      <div className="flex flex-col gap-2">
        <Button block loading={busy === "return"} onClick={() => decide("return")}>{a.returnIt}</Button>
        <Button block variant="gh" onClick={() => { if (!comment.trim()) { setError(a.commentNeeded); return; } setConfirmRefuse(true); }}>{a.refuse}</Button>
      </div>
      <ConfirmDialog open={confirmRefuse} danger title={a.refuseTitle} verb={a.refuseVerb} onClose={() => setConfirmRefuse(false)} onConfirm={() => { setConfirmRefuse(false); void decide("refuse"); }}>{a.refuseBody}</ConfirmDialog>
    </div>
  );
}
