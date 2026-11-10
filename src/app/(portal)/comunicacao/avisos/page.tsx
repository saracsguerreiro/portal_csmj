import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { NoticesView } from "./view";

export const metadata = { title: t.noticesPage.title };

export default function Page() {
  return <Suspense><Booted><NoticesView /></Booted></Suspense>;
}
