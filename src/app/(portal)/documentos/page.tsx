import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { DocumentsView } from "./view";

export const metadata = { title: t.docs.title };

export default function Page() {
  return <Suspense><Booted><DocumentsView /></Booted></Suspense>;
}
