import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { AbsencesView } from "./view";

export const metadata = { title: t.absencesPage.title };

export default function Page() {
  return <Suspense><Booted><AbsencesView /></Booted></Suspense>;
}
