"use client";

import { bump } from "@/lib/prefs";
import { t } from "@/i18n";

export function BlockRetry() {
  return <button type="button" className="link" onClick={() => bump()}>{t.common.tryAgain}</button>;
}
