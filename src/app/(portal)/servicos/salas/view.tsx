"use client";

import { LoadError, PageHeader } from "@/design-system";
import { RoomBooking } from "@/features/servicos/RoomBooking";
import { BlockRetry } from "@/features/home/BlockRetry";
import { t } from "@/i18n";
import { roomDay } from "@/lib/api-servicos";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";


export function RoomsView() {
  const s = useSession();
  const f = useQuery();
  let data;
  try { data = roomDay(s, f); } catch { data = null; }
  return (
    <div className="wrap flex flex-col gap-6 py-6 md:py-8">
      <PageHeader crumbs={[{ label: t.services.title, href: "/servicos" }, { label: t.rooms.title }]} title={t.rooms.title} description={t.rooms.lead} />
      {!data ? <LoadError what={t.rooms.what}><BlockRetry /></LoadError> : <RoomBooking data={data} view={f.vista === "semana" ? "semana" : "dia"} />}
    </div>
  );
}
