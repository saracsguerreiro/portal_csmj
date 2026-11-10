"use client";

import { useRouter } from "next/navigation";
import { t } from "@/i18n";

export function BlockRetry() {
  const router = useRouter();
  return <button type="button" className="link" onClick={() => router.refresh()}>{t.common.tryAgain}</button>;
}
