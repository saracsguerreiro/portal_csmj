import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { ServicesView } from "./view";

export const metadata = { title: t.services.title };

export default function Page() {
  return <Suspense><Booted><ServicesView /></Booted></Suspense>;
}
