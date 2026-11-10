import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { ContentEditor } from "@/features/painel/ContentEditor";
import { t } from "@/i18n";

export const metadata = { title: t.admin.list.titles.eventos };

export default function Page() {
  return <Suspense><Booted><ContentEditor kind="eventos" /></Booted></Suspense>;
}
