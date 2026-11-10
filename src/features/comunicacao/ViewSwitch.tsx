"use client";

import { CalendarDays, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Segmented } from "@/design-system";
import { t } from "@/i18n";

export function ViewSwitch({ value }: { value: "lista" | "calendario" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [current, setCurrent] = useState(value);
  useEffect(() => setCurrent(value), [value]);
  const change = (v: "lista" | "calendario") => {
    setCurrent(v);
    const next = new URLSearchParams(params.toString());
    if (v === "lista") next.delete("vista"); else next.set("vista", v);
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  return <Segmented legend={t.events.viewLegend} value={current} onChange={change} options={[{ value: "lista", label: t.events.list, icon: <List size={14} aria-hidden /> }, { value: "calendario", label: t.events.calendar, icon: <CalendarDays size={14} aria-hidden /> }]} />;
}
