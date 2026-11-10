import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { RequestDetailView } from "./view";

export const metadata = { title: t.services.myRequests };

export default function Page() {
  return <Suspense><Booted><RequestDetailView /></Booted></Suspense>;
}
