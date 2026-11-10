import { Suspense } from "react";
import { Booted } from "@/features/shell/Booted";
import { t } from "@/i18n";
import { MyRequestsView } from "./view";

export const metadata = { title: t.services.myRequests };

export default function Page() {
  return <Suspense><Booted><MyRequestsView /></Booted></Suspense>;
}
