import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { EventsView } from "./view";

export const metadata = { title: t.events.title };

export default function Page() {
  return <Suspense><Booted><EventsView /></Booted></Suspense>;
}
