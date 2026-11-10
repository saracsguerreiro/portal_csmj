"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/i18n";

/** Faixa no topo quando o browser perde a ligação. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return <div role="status" className="alert alert-warn !rounded-none"><div className="wrap flex items-center gap-2"><WifiOff size={18} aria-hidden />{t.errors.offlineBanner}</div></div>;
}
