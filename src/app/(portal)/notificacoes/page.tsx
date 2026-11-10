import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { NotificationsView } from "./view";

export const metadata = { title: t.notifPage.title };

export default function Page() {
  return <Suspense><Booted><NotificationsView /></Booted></Suspense>;
}
