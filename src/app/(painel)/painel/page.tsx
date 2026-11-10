import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { WorkView } from "@/features/painel/WorkView";
import { t } from "@/i18n";

export const metadata = { title: t.admin.items.trabalho };

export default function Page() {
  return <Suspense><Booted><WorkView /></Booted></Suspense>;
}
