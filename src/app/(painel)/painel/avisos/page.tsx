import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { ContentList } from "@/features/painel/ContentList";
import { t } from "@/i18n";

export const metadata = { title: t.admin.list.titles.avisos };

export default function Page() {
  return <Suspense><Booted><ContentList kind="avisos" /></Booted></Suspense>;
}
