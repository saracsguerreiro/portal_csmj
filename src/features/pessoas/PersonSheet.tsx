"use client";

import { UrlSheet } from "@/design-system";
import { personDetail } from "@/lib/api-pessoas";
import { useSession } from "@/lib/client";
import { useQuery } from "@/lib/use-query";
import { PersonProfile } from "./parts";
import { t } from "@/i18n";

export function PersonSheet() {
  const s = useSession();
  const { pessoa } = useQuery();
  if (!pessoa) return null;
  const p = personDetail(s, pessoa);
  if (!p) return null;
  return <UrlSheet param="pessoa" title={t.peoplePage.profile}><PersonProfile p={p} inSheet /></UrlSheet>;
}
